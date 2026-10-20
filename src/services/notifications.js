import {
  collection, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, serverTimestamp, where, writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase.js';
import { guardedWrite, LONG_WRITE_TIMEOUT_MS } from '../lib/network.js';
import { memberName } from '../lib/members.js';
import { logActivity } from './activity.js';

/*
  In-app notifications: users/{uid}/notifications. Like the activity log, a notification is added
  to the batch of the change it reports; the rules refuse one that doesn't match a real change.
  Only the recipient can read it, mark it read, answer "declined" once, or delete it.
*/

const notesCol = (uid) => collection(db, 'users', uid, 'notifications');

const EMPTY = { taskId: null, taskTitle: null, reason: null, dueDate: null, sourceId: null };

/** Adds a notification for `recipientId` to `batch`. Nobody is notified about their own action. */
export function notify(batch, project, actorId, recipientId, fields) {
  if (!recipientId || recipientId === actorId) return;
  batch.set(doc(notesCol(recipientId)), {
    ...EMPTY,
    ...fields,
    projectId: project.id,
    projectName: project.name,
    actorId,
    actorName: memberName(project, actorId),
    at: serverTimestamp(),
    read: false,
    response: null,
  });
}

/** The latest `max` notifications, newest first. Returns the unsubscribe function. */
export function subscribeToNotifications(uid, max, onData, onError) {
  return onSnapshot(
    query(notesCol(uid), orderBy('at', 'desc'), limit(max)),
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }))),
    onError
  );
}

export function markRead(uid, ids) {
  if (!ids.length) return Promise.resolve();
  return guardedWrite(() => {
    const batch = writeBatch(db);
    ids.forEach((id) => batch.update(doc(notesCol(uid), id), { read: true }));
    return batch.commit();
  });
}

/** Why a decline can't go ahead (shown as is): the situation changed since the notification. */
export class DeclineError extends Error {
  constructor(code) {
    super(code);
    this.code = code; // 'task-gone' | 'not-assigned' | 'not-member'
  }
}

/** Can this notification still be declined? (Only fresh assignments and project invitations.) */
export const canDecline = (note) => note.response == null && (note.type === 'task_assigned' || note.type === 'member_added');

async function loadProject(projectId) {
  const snap = await getDoc(doc(db, 'projects', projectId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Declines an assigned task: unassigns it, logs it, tells whoever assigned it (with the reason)
 * and marks the notification as answered, all in one batch.
 */
export function declineTask(note, reason, uid) {
  return guardedWrite(async () => {
    const project = await loadProject(note.projectId).catch(() => null);
    if (!project || !project.memberIds.includes(uid)) throw new DeclineError('not-member');
    const taskRef = doc(db, 'projects', note.projectId, 'tasks', note.taskId);
    const task = await getDoc(taskRef);
    if (!task.exists()) throw new DeclineError('task-gone');
    if (task.data().assigneeId !== uid) throw new DeclineError('not-assigned');

    const text = reason.trim();
    const batch = writeBatch(db);
    batch.update(taskRef, { assigneeId: null, updatedAt: serverTimestamp() });
    logActivity(batch, project, uid, { type: 'task_declined', taskId: note.taskId, taskTitle: task.data().title, reason: text });
    notify(batch, project, uid, note.actorId, {
      type: 'task_declined', taskId: note.taskId, taskTitle: task.data().title, reason: text, sourceId: note.id,
    });
    batch.update(doc(notesCol(uid), note.id), { read: true, response: 'declined' });
    await batch.commit();
  });
}

const BATCH_LIMIT = 500; // Firestore's max writes per batch

/**
 * Declines being added to a project = leaves it. Their tasks are unassigned first; the last batch
 * removes them, logs it, tells the owner (with the reason) and marks the invitation as answered, so a
 * failure part-way never leaves someone gone but still assigned.
 */
export function leaveProject(note, reason, uid) {
  return guardedWrite(async () => {
    const project = await loadProject(note.projectId).catch(() => null);
    if (!project || !project.memberIds.includes(uid)) throw new DeclineError('not-member');
    const assigned = await getDocs(query(collection(db, 'projects', project.id, 'tasks'), where('assigneeId', '==', uid)));

    const text = reason.trim();
    const chunks = [];
    for (let i = 0; i < assigned.docs.length; i += BATCH_LIMIT - 4) chunks.push(assigned.docs.slice(i, i + BATCH_LIMIT - 4));
    if (chunks.length === 0) chunks.push([]);

    for (const [i, chunk] of chunks.entries()) {
      const batch = writeBatch(db);
      chunk.forEach((task) => batch.update(task.ref, { assigneeId: null, updatedAt: serverTimestamp() }));
      if (i === chunks.length - 1) {
        const remaining = project.memberIds.filter((id) => id !== uid);
        const members = { ...project.members };
        delete members[uid];
        batch.update(doc(db, 'projects', project.id), { memberIds: remaining, members, updatedAt: serverTimestamp() });
        logActivity(batch, project, uid, { type: 'member_left', reason: text });
        notify(batch, project, uid, project.ownerId, { type: 'member_left', reason: text });
        batch.update(doc(notesCol(uid), note.id), { read: true, response: 'declined' });
      }
      await batch.commit();
    }
  }, LONG_WRITE_TIMEOUT_MS);
}

