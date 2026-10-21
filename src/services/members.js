import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteField,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase.js';
import { guardedWrite, LONG_WRITE_TIMEOUT_MS } from '../lib/network.js';
import { findUserByEmail } from './users.js';
import { logActivity } from './activity.js';
import { notify } from './notifications.js';
import { memberName } from '../lib/members.js';
import { DEFAULT_PERMS } from '../lib/permissions.js';
import { normalizePerms, permsDoc, setPermsInBatch } from './perms.js';

export const MAX_MEMBERS = 20; // keep in sync with firestore.rules

/** Expected failures, so the form can show a specific message instead of a generic one. */
export class MemberError extends Error {
  constructor(code) {
    super(code);
    this.code = code; // 'not-found' | 'duplicate' | 'full'
  }
}

const BATCH_LIMIT = 500; // Firestore's max writes per batch

/**
 * Adds an existing user to the project by email with the permissions the owner picked (saved in the same
 * batch, so a new member never exists without them), logs it and tells them. Owner only (rules).
 */
export function addMemberByEmail(project, email, actorId, perms = DEFAULT_PERMS) {
  return guardedWrite(async () => {
    const found = await findUserByEmail(email);
    if (!found) throw new MemberError('not-found');
    if (project.memberIds.includes(found.uid)) throw new MemberError('duplicate');
    if (project.memberIds.length >= MAX_MEMBERS) throw new MemberError('full');

    const list = normalizePerms(perms);
    const batch = writeBatch(db);
    batch.update(doc(db, 'projects', project.id), {
      memberIds: arrayUnion(found.uid),
      [`members.${found.uid}`]: { displayName: found.displayName },
      updatedAt: serverTimestamp(),
    });
    setPermsInBatch(batch, project.id, found.uid, list);
    logActivity(batch, project, actorId, { type: 'member_added', targetId: found.uid, targetName: found.displayName, perms: list });
    notify(batch, project, actorId, found.uid, { type: 'member_added', perms: list });
    await batch.commit();
    return found;
  });
}

/**
 * Removes a member and unassigns their tasks, in one go: the tasks are cleared first and the
 * project update is in the last batch, so a failure part-way never leaves a removed member
 * still assigned (it only leaves the member in place, and the removal can be retried).
 */
export function removeMember(project, uid, actorId) {
  return guardedWrite(async () => {
    const assigned = await getDocs(query(collection(db, 'projects', project.id, 'tasks'), where('assigneeId', '==', uid)));
    const projectRef = doc(db, 'projects', project.id);
    const removal = {
      memberIds: arrayRemove(uid),
      [`members.${uid}`]: deleteField(),
      updatedAt: serverTimestamp(),
    };

    const chunks = [];
    for (let i = 0; i < assigned.docs.length; i += BATCH_LIMIT - 3) chunks.push(assigned.docs.slice(i, i + BATCH_LIMIT - 3));
    if (chunks.length === 0) chunks.push([]);

    for (const [i, chunk] of chunks.entries()) {
      const batch = writeBatch(db);
      chunk.forEach((task) => batch.update(task.ref, { assigneeId: null, updatedAt: serverTimestamp() }));
      if (i === chunks.length - 1) {
        batch.update(projectRef, removal);
        batch.delete(permsDoc(project.id, uid)); // re-adding them later starts from fresh permissions
        logActivity(batch, project, actorId, { type: 'member_removed', targetId: uid, targetName: memberName(project, uid) });
      }
      await batch.commit();
    }
  }, LONG_WRITE_TIMEOUT_MS);
}
