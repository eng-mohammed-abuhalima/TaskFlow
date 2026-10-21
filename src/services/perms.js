import { collection, doc, onSnapshot, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase.js';
import { guardedWrite } from '../lib/network.js';
import { DEFAULT_PERMS, PERMS } from '../lib/permissions.js';
import { memberName } from '../lib/members.js';
import { logActivity } from './activity.js';
import { notify } from './notifications.js';

/*
  Member permissions: projects/{id}/memberPerms/{uid} = { perms, updatedAt }. One document per member,
  because the rules can check a document but can't loop over a map. Only the owner writes them; a member
  reads their own. No document = DEFAULT_PERMS ("contributor"), so older members keep working as before.
*/

export const permsDoc = (projectId, uid) => doc(db, 'projects', projectId, 'memberPerms', uid);
export const permsCol = (projectId) => collection(db, 'projects', projectId, 'memberPerms');

/** Keeps them in the canonical order, so equal sets are equal lists (the rules compare lists). */
export const normalizePerms = (perms) => PERMS.filter((p) => perms.includes(p));

/** Adds "save these permissions" to a batch (used when adding a member and when changing them). */
export function setPermsInBatch(batch, projectId, uid, perms) {
  batch.set(permsDoc(projectId, uid), { perms: normalizePerms(perms), updatedAt: serverTimestamp() });
}

/** The signed-in member's own permissions, live. onData(perms). */
export function subscribeToMyPerms(projectId, uid, onData) {
  return onSnapshot(
    permsDoc(projectId, uid),
    (snap) => onData(snap.exists() ? snap.data().perms : DEFAULT_PERMS),
    () => onData(DEFAULT_PERMS) // e.g. just removed from the project: the page itself shows "no access"
  );
}

/** Owner only: everyone's permissions, live. onData({ uid: perms }). */
export function subscribeToProjectPerms(projectId, onData, onError) {
  return onSnapshot(
    permsCol(projectId),
    (snap) => onData(Object.fromEntries(snap.docs.map((d) => [d.id, d.data().perms]))),
    onError
  );
}

/** Owner changes a member's permissions: saved, logged, and the member is told, in one batch. */
export function setMemberPerms(project, uid, perms, actorId) {
  return guardedWrite(() => {
    const list = normalizePerms(perms);
    const batch = writeBatch(db);
    setPermsInBatch(batch, project.id, uid, list);
    logActivity(batch, project, actorId, { type: 'member_perms', targetId: uid, targetName: memberName(project, uid), perms: list });
    notify(batch, project, actorId, uid, { type: 'perms_changed', perms: list });
    return batch.commit();
  });
}
