import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase.js';

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

/** New tasks always start as "todo" (SRS FR-11); the rules enforce it too. */
export function createTask(projectId, values, uid) {
  return addDoc(tasksCol(projectId), {
    ...clean(values),
    status: 'todo',
    createdBy: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Updates the editable fields. `status` is only sent when it changed, so a creator who isn't
 * the assignee can still save the other fields (the rules reject any status change from them).
 */
export function updateTask(projectId, task, values) {
  const changes = { ...clean(values), updatedAt: serverTimestamp() };
  if (values.status !== task.status) changes.status = values.status;
  return updateDoc(taskDoc(projectId, task.id), changes);
}

export function deleteTask(projectId, taskId) {
  return deleteDoc(taskDoc(projectId, taskId));
}
