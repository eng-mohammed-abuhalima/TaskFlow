import { collection, doc, getDocs, onSnapshot, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase.js';
import { guardedWrite } from '../lib/network.js';
import { memberName } from '../lib/members.js';
import { editedFields, logActivity } from './activity.js';
import { notify } from './notifications.js';

const tasksCol = (projectId) => collection(db, 'projects', projectId, 'tasks');
const taskDoc = (projectId, taskId) => doc(db, 'projects', projectId, 'tasks', taskId);

/** Editable fields, trimmed and normalised (empty due date / assignee -> null). */
const clean = ({ title, description, priority, assigneeId, dueDate }) => ({
  title: title.trim(),
  description: description.trim(),
  priority,
  assigneeId: assigneeId || null,
  dueDate: dueDate || null,
});

/** One-shot read of a project's tasks (the dashboard aggregates these client-side; no collection-group query). */
export async function listTasks(projectId) {
  const snap = await getDocs(tasksCol(projectId));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Live task list for a project, newest first. Returns the unsubscribe function.
 * Pending server timestamps use the local estimate so new tasks sort correctly right away.
 */
export function subscribeToTasks(projectId, onData, onError) {
  return onSnapshot(
    tasksCol(projectId),
    (snap) => {
      const tasks = snap.docs.map((d) => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }));
      tasks.sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
      onData(tasks);
    },
    onError
  );
}

const nameOf = (project, uid) => (uid ? memberName(project, uid) : null);

/*
  Every task write goes in one batch with its activity entries and notifications, so the log
  and the change are saved together or not at all (the rules check one against the other).
*/

/** New tasks always start as "todo" (SRS FR-11); the rules enforce it too. `values.rank`: its place on the board. */
export function createTask(project, values, uid) {
  return guardedWrite(() => {
    const data = clean(values);
    const ref = doc(tasksCol(project.id));
    const batch = writeBatch(db);
    batch.set(ref, {
      ...data, ...(values.rank ? { rank: values.rank } : {}),
      status: 'todo', createdBy: uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    });
    logActivity(batch, project, uid, {
      type: 'task_created', taskId: ref.id, taskTitle: data.title,
      targetId: data.assigneeId, targetName: nameOf(project, data.assigneeId),
    });
    notify(batch, project, uid, data.assigneeId, { type: 'task_assigned', taskId: ref.id, taskTitle: data.title });
    return batch.commit();
  });
}

/**
 * Updates the editable fields. `status` is only sent when it changed, so a creator who isn't
 * the assignee can still save the other fields (the rules reject any status change from them).
 * Logs each kind of change on its own (status, assignee, other fields) and tells a new assignee
 * that they got the task, and the current assignee that the due date moved.
 *
 * A status change is also a status update: `update.message` (optional) goes to the owner, who is
 * always told when someone else changes the status (the rules require it, through `statusNoteId`),
 * and to any members in `update.recipients`.
 *
 * `values.rank` (optional) moves the task on the board; a drag to another column is just a status
 * change with a new rank, so it's logged and notified like any other.
 */
export function updateTask(project, task, values, uid, update = {}) {
  return guardedWrite(() => {
    const data = clean(values);
    const changes = { ...data, updatedAt: serverTimestamp() };
    const statusChanged = values.status !== task.status;
    if (statusChanged) changes.status = values.status;
    if (values.rank && values.rank !== task.rank) changes.rank = values.rank;

    const batch = writeBatch(db);
    const about = { taskId: task.id, taskTitle: data.title };

    if (statusChanged) {
      const message = update.message?.trim() || null;
      const status = { ...about, type: 'task_status', status: values.status, message };
      logActivity(batch, project, uid, { ...about, type: 'task_status', from: task.status, to: values.status, message });
      if (uid !== project.ownerId) changes.statusNoteId = notify(batch, project, uid, project.ownerId, status);
      const others = new Set(update.recipients ?? []);
      others.delete(project.ownerId);
      for (const recipient of others) {
        if (project.memberIds.includes(recipient)) notify(batch, project, uid, recipient, status);
      }
    }
    // Added after the notifications: batch.update copies `changes` now, and it needs statusNoteId.
    batch.update(taskDoc(project.id, task.id), changes);
    const before = task.assigneeId ?? null;
    if (data.assigneeId !== before) {
      if (data.assigneeId) {
        logActivity(batch, project, uid, { ...about, type: 'task_assigned', targetId: data.assigneeId, targetName: nameOf(project, data.assigneeId) });
        notify(batch, project, uid, data.assigneeId, { ...about, type: 'task_assigned' });
      } else {
        logActivity(batch, project, uid, { ...about, type: 'task_unassigned', targetId: before, targetName: nameOf(project, before) });
      }
    } else if ((task.dueDate ?? null) !== data.dueDate) {
      notify(batch, project, uid, data.assigneeId, { ...about, type: 'task_due_changed', dueDate: data.dueDate });
    }
    const fields = editedFields(task, data);
    if (fields.length) logActivity(batch, project, uid, { ...about, type: 'task_updated', fields });
    return batch.commit();
  });
}

/**
 * Gives tasks their board order ([{ id, rank }]) without other changes. Not logged: reordering isn't a
 * change to the task. The owner's board uses it once for tasks made before the board existed.
 */
export function setRanks(projectId, ranks) {
  return guardedWrite(() => {
    const batch = writeBatch(db);
    for (const { id, rank } of ranks) batch.update(taskDoc(projectId, id), { rank, updatedAt: serverTimestamp() });
    return batch.commit();
  });
}

/** Deletes the task, logs it and tells its assignee. */
export function deleteTask(project, task, uid) {
  return guardedWrite(() => {
    const batch = writeBatch(db);
    batch.delete(taskDoc(project.id, task.id));
    const about = { taskId: task.id, taskTitle: task.title };
    logActivity(batch, project, uid, { ...about, type: 'task_deleted' });
    notify(batch, project, uid, task.assigneeId, { ...about, type: 'task_deleted' });
    return batch.commit();
  });
}
