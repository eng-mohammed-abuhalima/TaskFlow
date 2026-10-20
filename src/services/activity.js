import { collection, doc, limit, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase.js';
import { memberName } from '../lib/members.js';

/*
  Activity log: projects/{id}/activity. Each entry is added to the SAME batch as the change it
  describes, so both are saved or neither is. The rules check every entry against that change and
  let only the owner read the log. Entries store facts (type, ids, names), not sentences, so the
  log is shown in whichever language the reader picks (see lib/activityText.js).
*/

const activityCol = (projectId) => collection(db, 'projects', projectId, 'activity');

const EMPTY = {
  taskId: null, taskTitle: null, targetId: null, targetName: null,
  from: null, to: null, fields: null, reason: null,
};

/** Adds one entry to `batch`. `fields` overrides EMPTY (type, taskId, targetId, …). */
export function logActivity(batch, project, actorId, fields) {
  batch.set(doc(activityCol(project.id)), {
    ...EMPTY,
    ...fields,
    actorId,
    actorName: memberName(project, actorId),
    at: serverTimestamp(),
  });
}

/** Task fields whose change is logged as "edited" (status and assignee get their own entries). */
const EDIT_FIELDS = ['title', 'description', 'priority', 'dueDate'];
export const editedFields = (before, after) => EDIT_FIELDS.filter((f) => (before[f] ?? null) !== (after[f] ?? null));

/** Live log, newest first. Returns the unsubscribe function. */
export function subscribeToActivity(projectId, max, onData, onError) {
  return onSnapshot(
    query(activityCol(projectId), orderBy('at', 'desc'), limit(max)),
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) })), snap.size >= max),
    onError
  );
}

