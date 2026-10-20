import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteField,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase.js';
import { findUserByEmail } from './users.js';

export const MAX_MEMBERS = 20; // keep in sync with firestore.rules

/** Expected failures, so the form can show a specific message instead of a generic one. */
export class MemberError extends Error {
  constructor(code) {
    super(code);
    this.code = code; // 'not-found' | 'duplicate' | 'full'
  }
}

const BATCH_LIMIT = 500; // Firestore's max writes per batch

/** Adds an existing user to the project by email. Owner only (enforced by the rules). */
export async function addMemberByEmail(project, email) {
  const found = await findUserByEmail(email);
  if (!found) throw new MemberError('not-found');
  if (project.memberIds.includes(found.uid)) throw new MemberError('duplicate');
  if (project.memberIds.length >= MAX_MEMBERS) throw new MemberError('full');

  await updateDoc(doc(db, 'projects', project.id), {
    memberIds: arrayUnion(found.uid),
    [`members.${found.uid}`]: { displayName: found.displayName },
    updatedAt: serverTimestamp(),
  });
  return found;
}

/**
 * Removes a member and unassigns their tasks, in one go: the tasks are cleared first and the
 * project update is in the last batch, so a failure part-way never leaves a removed member
 * still assigned (it only leaves the member in place, and the removal can be retried).
 */
export async function removeMember(project, uid) {
  const assigned = await getDocs(query(collection(db, 'projects', project.id, 'tasks'), where('assigneeId', '==', uid)));
  const projectRef = doc(db, 'projects', project.id);
  const removal = {
    memberIds: arrayRemove(uid),
    [`members.${uid}`]: deleteField(),
    updatedAt: serverTimestamp(),
  };

  const chunks = [];
  for (let i = 0; i < assigned.docs.length; i += BATCH_LIMIT - 1) chunks.push(assigned.docs.slice(i, i + BATCH_LIMIT - 1));
  if (chunks.length === 0) chunks.push([]);

  for (const [i, chunk] of chunks.entries()) {
    const batch = writeBatch(db);
    chunk.forEach((task) => batch.update(task.ref, { assigneeId: null, updatedAt: serverTimestamp() }));
    if (i === chunks.length - 1) batch.update(projectRef, removal);
    await batch.commit();
  }
}
