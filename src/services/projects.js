import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
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

export async function createProject(values, uid) {
  const ref = await addDoc(projectsCol, {
    ...clean(values),
    ownerId: uid,
    memberIds: [uid],
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

/** The project, or null when it doesn't exist. Throws permission-denied for non-members. */
export async function getProject(id) {
  const snap = await getDoc(doc(db, 'projects', id));
  return snap.exists() ? fromSnap(snap) : null;
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
