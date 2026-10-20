import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase.js';

const projectsCol = collection(db, 'projects');
const BATCH_LIMIT = 500; // Firestore's max writes per batch

const fromSnap = (snap) => ({ id: snap.id, ...snap.data() });
const clean = ({ name, description }) => ({ name: name.trim(), description: description.trim() });

/**
 * `members` mirrors `memberIds` with a display name per member, so members can see each other's
 * names without reading each other's private user documents.
 */
export async function createProject(values, user) {
  const ref = await addDoc(projectsCol, {
    ...clean(values),
    ownerId: user.uid,
    memberIds: [user.uid],
    members: { [user.uid]: { displayName: user.displayName || user.email.split('@')[0] } },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Projects the user owns or belongs to, most recently updated first (sorted here, so no index is needed). */
export async function listMyProjects(uid) {
  const snap = await getDocs(query(projectsCol, where('memberIds', 'array-contains', uid)));
  return snap.docs.map(fromSnap).sort((a, b) => (b.updatedAt?.toMillis() ?? 0) - (a.updatedAt?.toMillis() ?? 0));
}

/**
 * Live project: onData(project) or onData(null) when it doesn't exist; onError(err) with
 * code 'permission-denied' for non-members (or when a member is removed while watching).
 * Returns the unsubscribe function.
 */
export function subscribeToProject(id, onData, onError) {
  return onSnapshot(
    doc(db, 'projects', id),
    (snap) => onData(snap.exists() ? { id: snap.id, ...snap.data({ serverTimestamps: 'estimate' }) } : null),
    onError
  );
}

export function updateProject(id, values) {
  return updateDoc(doc(db, 'projects', id), { ...clean(values), updatedAt: serverTimestamp() });
}

/**
 * Firestore doesn't delete subcollections, so remove the tasks first (in batches),
 * then the project. If a batch fails the project is kept and the delete can be retried.
 */
export async function deleteProject(id) {
  const tasks = await getDocs(collection(db, 'projects', id, 'tasks'));
  for (let i = 0; i < tasks.docs.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db);
    tasks.docs.slice(i, i + BATCH_LIMIT).forEach((t) => batch.delete(t.ref));
    await batch.commit();
  }
  await deleteDoc(doc(db, 'projects', id));
}
