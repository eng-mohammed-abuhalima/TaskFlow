import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase.js';
import { guardedWrite, LONG_WRITE_TIMEOUT_MS } from '../lib/network.js';
import { logActivity } from './activity.js';

const projectsCol = collection(db, 'projects');
const BATCH_LIMIT = 500; // Firestore's max writes per batch

const fromSnap = (snap) => ({ id: snap.id, ...snap.data() });
const clean = ({ name, description }) => ({ name: name.trim(), description: description.trim() });

/**
 * `members` mirrors `memberIds` with a display name per member, so members can see each other's
 * names without reading each other's private user documents.
 */
export async function createProject(values, user) {
  const ref = await guardedWrite(() =>
    addDoc(projectsCol, {
      ...clean(values),
      ownerId: user.uid,
      memberIds: [user.uid],
      members: { [user.uid]: { displayName: user.displayName || user.email.split('@')[0] } },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  );
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

/** Saves name/description and logs which of them changed. Owner only (enforced by the rules). */
export function updateProject(project, values, uid) {
  return guardedWrite(() => {
    const data = clean(values);
    const fields = ['name', 'description'].filter((f) => (project[f] ?? '') !== data[f]);
    const batch = writeBatch(db);
    batch.update(doc(db, 'projects', project.id), { ...data, updatedAt: serverTimestamp() });
    if (fields.length) logActivity(batch, project, uid, { type: 'project_updated', fields });
    return batch.commit();
  });
}

/**
 * Firestore doesn't delete subcollections, so remove the activity log and the tasks first
 * (in batches), then the project. If a batch fails the project is kept and the delete can be retried.
 */
export function deleteProject(id) {
  return guardedWrite(async () => {
    for (const sub of ['activity', 'tasks']) {
      const docs = (await getDocs(collection(db, 'projects', id, sub))).docs;
      for (let i = 0; i < docs.length; i += BATCH_LIMIT) {
        const batch = writeBatch(db);
        docs.slice(i, i + BATCH_LIMIT).forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
    }
    await deleteDoc(doc(db, 'projects', id));
  }, LONG_WRITE_TIMEOUT_MS);
}
