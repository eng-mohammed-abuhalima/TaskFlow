import { addDoc, collection, deleteDoc, doc, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase.js';
import { guardedWrite } from '../lib/network.js';
import { memberName } from '../lib/members.js';

/*
  Project chat: projects/{id}/messages (every member reads and writes) and projects/{id}/chatReads/{uid}
  (when each member last opened the chat: unread count and "seen" ticks). The rules check that a message
  is sent under the sender's own id and project name, and that readAt is the server's time.
*/

export const MAX_MESSAGE = 1000; // keep in sync with firestore.rules

const messagesCol = (projectId) => collection(db, 'projects', projectId, 'messages');
const readsCol = (projectId) => collection(db, 'projects', projectId, 'chatReads');

const toDate = (ts) => (ts?.toDate ? ts.toDate() : null);

/** Live latest `max` messages, oldest first. `pending` = not yet confirmed by the server. */
export function subscribeToMessages(projectId, max, onData, onError) {
  return onSnapshot(
    query(messagesCol(projectId), orderBy('createdAt', 'desc'), limit(max)),
    { includeMetadataChanges: true },
    (snap) => {
      const messages = snap.docs
        .map((d) => {
          const data = d.data({ serverTimestamps: 'estimate' });
          return { id: d.id, ...data, createdAt: toDate(data.createdAt) ?? new Date(), pending: d.metadata.hasPendingWrites };
        })
        .reverse();
      onData(messages, snap.size >= max);
    },
    onError
  );
}

/** Live { uid: Date } of when each member last opened the chat. */
export function subscribeToReads(projectId, onData, onError) {
  return onSnapshot(
    readsCol(projectId),
    (snap) => onData(Object.fromEntries(snap.docs.map((d) => [d.id, toDate(d.data({ serverTimestamps: 'estimate' }).readAt)]))),
    onError
  );
}

export function sendMessage(project, uid, text) {
  return guardedWrite(() =>
    addDoc(messagesCol(project.id), {
      text: text.trim(),
      authorId: uid,
      authorName: memberName(project, uid),
      createdAt: serverTimestamp(),
    })
  );
}

export function deleteMessage(projectId, messageId) {
  return guardedWrite(() => deleteDoc(doc(messagesCol(projectId), messageId)));
}

/** "I've read everything up to now". */
export function markChatRead(projectId, uid) {
  return guardedWrite(() => setDoc(doc(readsCol(projectId), uid), { readAt: serverTimestamp() }));
}
