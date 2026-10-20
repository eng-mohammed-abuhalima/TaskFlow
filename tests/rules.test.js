// Firestore security rules tests. Run with: npm run test:rules
// (starts the Firestore emulator, runs these against firestore.rules, shuts it down: no real data is touched).
//
// Cast: owner (owns project p1), member (member of p1), outsider (owns p2, not in p1),
// extra (a registered user who is in no project), and signed-out visitors.
import { after, before, beforeEach, describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import {
  addDoc, arrayRemove, arrayUnion, collection, collectionGroup, deleteDoc, deleteField, doc,
  getDoc, getDocs, query, serverTimestamp, setDoc, Timestamp, updateDoc, where, writeBatch,
} from 'firebase/firestore';

const NAMES = { owner: 'Owner Demo', member: 'Member Demo', outsider: 'Outsider Demo', extra: 'Extra Person' };
const email = (uid) => `${uid}@example.test`;
const P = 'p1';
const ts = serverTimestamp;

// RULES_FILE lets a different rules file be tested (used to prove these tests catch deliberately broken rules).
const RULES_PATH = process.env.RULES_FILE || new URL('../firestore.rules', import.meta.url);

let env;
before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-taskflow',
    firestore: { rules: readFileSync(RULES_PATH, 'utf8') },
  });
});
after(() => env.cleanup());
beforeEach(async () => {
  await env.clearFirestore();
  await seed();
});

// Contexts and references
const as = (uid) => env.authenticatedContext(uid, { email: email(uid) }).firestore();
const anon = () => env.unauthenticatedContext().firestore();
const projRef = (db, id = P) => doc(db, 'projects', id);
const tasksCol = (db, pid = P) => collection(db, 'projects', pid, 'tasks');
const taskRef = (db, id, pid = P) => doc(db, 'projects', pid, 'tasks', id);

// Valid documents the tests then break one field at a time
const newProject = (uid, o = {}) => ({
  name: 'Mobile App', description: '', ownerId: uid, memberIds: [uid],
  members: { [uid]: { displayName: NAMES[uid] } }, createdAt: ts(), updatedAt: ts(), ...o,
});
const newTask = (o = {}) => ({
  title: 'New task', description: '', status: 'todo', priority: 'low', assigneeId: null, dueDate: null,
  createdBy: 'member', createdAt: ts(), updatedAt: ts(), ...o,
});
const without = (obj, key) => { const copy = { ...obj }; delete copy[key]; return copy; };

async function seed() {
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    const now = Timestamp.now();
    for (const [uid, name] of Object.entries(NAMES)) {
      await setDoc(doc(db, 'users', uid), { displayName: name, email: email(uid), createdAt: now });
      await setDoc(doc(db, 'userEmails', email(uid)), { uid, displayName: name });
    }
    await setDoc(projRef(db), {
      name: 'Website Redesign', description: '', ownerId: 'owner', memberIds: ['owner', 'member'],
      members: { owner: { displayName: NAMES.owner }, member: { displayName: NAMES.member } }, createdAt: now, updatedAt: now,
    });
    await setDoc(projRef(db, 'p2'), {
      name: 'Other Project', description: '', ownerId: 'outsider', memberIds: ['outsider'],
      members: { outsider: { displayName: NAMES.outsider } }, createdAt: now, updatedAt: now,
    });
    const task = (o) => ({
      title: 'A task', description: '', status: 'todo', priority: 'medium', assigneeId: null, dueDate: null,
      createdBy: 'owner', createdAt: now, updatedAt: now, ...o,
    });
    await setDoc(taskRef(db, 'byOwner'), task({}));
    await setDoc(taskRef(db, 'byMember'), task({ createdBy: 'member' }));
    await setDoc(taskRef(db, 'assignedToMember'), task({ assigneeId: 'member' })); // created by the owner
    await setDoc(taskRef(db, 'other', 'p2'), task({ createdBy: 'outsider' }));
  });
}

const allows = (name, fn) => it(`allows: ${name}`, () => assertSucceeds(fn()));
const denies = (name, fn) => it(`denies: ${name}`, () => assertFails(fn()));

describe('signed-out visitors', () => {
  denies('reading a profile', () => getDoc(doc(anon(), 'users', 'owner')));
  denies('reading an email lookup', () => getDoc(doc(anon(), 'userEmails', email('owner'))));
  denies('reading a project', () => getDoc(projRef(anon())));
  denies('reading a task', () => getDoc(taskRef(anon(), 'byOwner')));
  denies('listing tasks', () => getDocs(tasksCol(anon())));
  denies('creating a project', () => addDoc(collection(anon(), 'projects'), newProject('owner')));
  denies('creating a task', () => addDoc(tasksCol(anon()), newTask()));
});

describe('users/{uid} (private profile)', () => {
  const profile = (uid, o = {}) => ({ displayName: 'New Person', email: email(uid), createdAt: ts(), ...o });
  const register = (uid, data) => setDoc(doc(as(uid), 'users', uid), data);

  allows('reading your own profile', () => getDoc(doc(as('owner'), 'users', 'owner')));
  denies('reading someone else’s profile', () => getDoc(doc(as('owner'), 'users', 'member')));
  denies('listing all profiles', () => getDocs(collection(as('owner'), 'users')));
  allows('creating your own profile', () => register('newbie', profile('newbie')));
  denies('creating a profile for another uid', () => setDoc(doc(as('newbie'), 'users', 'owner'), profile('newbie')));
  denies('an email that is not the account email', () => register('newbie', profile('newbie', { email: 'other@example.test' })));
  denies('an extra field (e.g. a role)', () => register('newbie', profile('newbie', { role: 'admin' })));
  denies('a one-letter name', () => register('newbie', profile('newbie', { displayName: 'A' })));
  denies('a 61-character name', () => register('newbie', profile('newbie', { displayName: 'x'.repeat(61) })));
  denies('a client-made createdAt', () => register('newbie', profile('newbie', { createdAt: Timestamp.now() })));
  allows('renaming yourself', () => updateDoc(doc(as('owner'), 'users', 'owner'), { displayName: 'Renamed Owner' }));
  denies('changing your email', () => updateDoc(doc(as('owner'), 'users', 'owner'), { email: 'new@example.test' }));
  denies('changing createdAt', () => updateDoc(doc(as('owner'), 'users', 'owner'), { createdAt: Timestamp.now() }));
  denies('renaming someone else', () => updateDoc(doc(as('owner'), 'users', 'member'), { displayName: 'Hacked' }));
  denies('deleting your profile', () => deleteDoc(doc(as('owner'), 'users', 'owner')));
});

describe('userEmails/{email} (lookup for "add member by email")', () => {
  const lookup = (uid, o = {}) => ({ uid, displayName: 'New Person', ...o });
  const lookupRef = (uid, key = email(uid)) => doc(as(uid), 'userEmails', key);

  allows('looking up an email while signed in', () => getDoc(doc(as('outsider'), 'userEmails', email('owner'))));
  denies('listing every email', () => getDocs(collection(as('owner'), 'userEmails')));
  allows('registering your own email', () => setDoc(lookupRef('newbie'), lookup('newbie')));
  denies('registering someone else’s email', () => setDoc(lookupRef('newbie', 'victim@example.test'), lookup('newbie')));
  denies('pointing your email at another uid', () => setDoc(lookupRef('newbie'), lookup('owner')));
  denies('a lookup without a name', () => setDoc(lookupRef('newbie'), { uid: 'newbie' }));
  denies('an extra field', () => setDoc(lookupRef('newbie'), lookup('newbie', { isAdmin: true })));
  allows('updating the name on your own lookup', () => updateDoc(lookupRef('owner'), { displayName: 'Owner Renamed' }));
  denies('changing the uid of your lookup', () => updateDoc(lookupRef('owner'), { uid: 'member' }));
  denies('updating someone else’s lookup', () => updateDoc(doc(as('owner'), 'userEmails', email('member')), { displayName: 'Hacked' }));
  denies('deleting your lookup', () => deleteDoc(lookupRef('owner')));
});

describe('reading projects', () => {
  allows('the owner reads the project', () => getDoc(projRef(as('owner'))));
  allows('a member reads the project', () => getDoc(projRef(as('member'))));
  denies('an outsider reading someone else’s project (TC-13)', () => getDoc(projRef(as('outsider'))));
  allows('"reading" a project that does not exist, so the app can show 404 instead of 403', () => getDoc(projRef(as('outsider'), 'nope')));
  allows('listing your own projects', () => getDocs(query(collection(as('member'), 'projects'), where('memberIds', 'array-contains', 'member'))));
  denies('listing another person’s projects', () => getDocs(query(collection(as('outsider'), 'projects'), where('memberIds', 'array-contains', 'owner'))));
  denies('listing every project without a filter', () => getDocs(collection(as('outsider'), 'projects')));
});

describe('creating projects', () => {
  const create = (uid, o) => addDoc(collection(as(uid), 'projects'), newProject(uid, o));

  allows('creating your own project', () => create('extra'));
  denies('naming someone else as owner', () => create('extra', { ownerId: 'owner' }));
  denies('adding other people at creation', () => create('extra', { memberIds: ['extra', 'owner'] }));
  denies('a members map with another person in it', () => create('extra', { members: { extra: { displayName: NAMES.extra }, owner: { displayName: NAMES.owner } } }));
  denies('a member name that is not your profile name', () => create('extra', { members: { extra: { displayName: 'Boss Man' } } }));
  denies('a 2-letter name', () => create('extra', { name: 'ab' }));
  denies('an 81-character name', () => create('extra', { name: 'x'.repeat(81) }));
  allows('an 80-character name', () => create('extra', { name: 'x'.repeat(80) }));
  denies('a 1001-character description', () => create('extra', { description: 'x'.repeat(1001) }));
  denies('a non-string description', () => create('extra', { description: 5 }));
  denies('an extra field', () => create('extra', { isPublic: true }));
  denies('a client-made createdAt', () => create('extra', { createdAt: Timestamp.now() }));
  denies('no members map', () => addDoc(collection(as('extra'), 'projects'), without(newProject('extra'), 'members')));
});

describe('updating and deleting projects', () => {
  const edit = (uid, data) => updateDoc(projRef(as(uid)), { ...data, updatedAt: ts() });

  allows('the owner renaming it', () => edit('owner', { name: 'Website Redesign 2026' }));
  allows('the owner editing the description', () => edit('owner', { description: 'New text' }));
  denies('a member editing it (TC-06)', () => edit('member', { name: 'Hacked' }));
  denies('an outsider editing it', () => edit('outsider', { name: 'Hacked' }));
  denies('the owner changing ownerId', () => edit('owner', { ownerId: 'member' }));
  denies('the owner changing createdAt', () => edit('owner', { createdAt: Timestamp.now() }));
  denies('a 2-letter name', () => edit('owner', { name: 'ab' }));
  denies('an 81-character name', () => edit('owner', { name: 'x'.repeat(81) }));
  denies('a 1001-character description', () => edit('owner', { description: 'x'.repeat(1001) }));
  denies('an unknown field', () => edit('owner', { admins: ['member'] }));
  denies('a client-made updatedAt', () => updateDoc(projRef(as('owner')), { name: 'Valid name', updatedAt: Timestamp.now() }));
  allows('the owner deleting the project', () => deleteDoc(projRef(as('owner'))));
  denies('a member deleting it', () => deleteDoc(projRef(as('member'))));
  denies('an outsider deleting it', () => deleteDoc(projRef(as('outsider'))));
});

describe('membership', () => {
  const entry = (uid, name = NAMES[uid]) => ({ displayName: name });
  const add = (db, uid, name) => updateDoc(projRef(db), { memberIds: arrayUnion(uid), [`members.${uid}`]: entry(uid, name), updatedAt: ts() });
  const remove = (db, uid) => updateDoc(projRef(db), { memberIds: arrayRemove(uid), [`members.${uid}`]: deleteField(), updatedAt: ts() });
  const seedProject = (id, data) => env.withSecurityRulesDisabled((ctx) => setDoc(projRef(ctx.firestore(), id), { createdAt: Timestamp.now(), updatedAt: Timestamp.now(), description: '', name: 'Seeded', ...data }));

  allows('the owner adding an existing user with their real name', () => add(as('owner'), 'extra'));
  denies('the owner adding someone under a different name (spoofing)', () => add(as('owner'), 'extra', 'CEO'));
  denies('adding a uid that has no profile', () => add(as('owner'), 'ghost', 'Ghost Person'));
  denies('adding without a name entry', () => updateDoc(projRef(as('owner')), { memberIds: arrayUnion('extra'), updatedAt: ts() }));
  denies('adding two people at once', () => updateDoc(projRef(as('owner')), {
    memberIds: arrayUnion('extra', 'outsider'), 'members.extra': entry('extra'), 'members.outsider': entry('outsider'), updatedAt: ts(),
  }));
  denies('renaming an existing member', () => updateDoc(projRef(as('owner')), { 'members.member': { displayName: 'Renamed' }, updatedAt: ts() }));
  denies('a member adding someone', () => add(as('member'), 'extra'));
  denies('an outsider adding themselves', () => add(as('extra'), 'extra'));
  allows('the owner removing a member', () => remove(as('owner'), 'member'));
  denies('removing the owner', () => remove(as('owner'), 'owner'));
  denies('removing a member but leaving their name entry', () => updateDoc(projRef(as('owner')), { memberIds: arrayRemove('member'), updatedAt: ts() }));
  denies('a member removing the owner', () => remove(as('member'), 'owner'));
  denies('an outsider removing a member', () => remove(as('extra'), 'member'));

  it('denies: removing two members at once', async () => {
    await seedProject('three', { ownerId: 'owner', memberIds: ['owner', 'member', 'extra'], members: { owner: entry('owner'), member: entry('member'), extra: entry('extra') } });
    await assertFails(updateDoc(projRef(as('owner'), 'three'), {
      memberIds: arrayRemove('member', 'extra'), 'members.member': deleteField(), 'members.extra': deleteField(), updatedAt: ts(),
    }));
  });

  it('denies: going over 20 members', async () => {
    const ids = ['owner', ...Array.from({ length: 19 }, (_, i) => `m${i}`)];
    await seedProject('big', { ownerId: 'owner', memberIds: ids, members: Object.fromEntries(ids.map((id) => [id, { displayName: `Person ${id}` }])) });
    await assertFails(updateDoc(projRef(as('owner'), 'big'), { memberIds: arrayUnion('extra'), 'members.extra': entry('extra'), updatedAt: ts() }));
  });

  it('allows: filling in `members` for a project made before that field existed', async () => {
    await seedProject('legacy', { ownerId: 'owner', memberIds: ['owner'] });
    await assertSucceeds(updateDoc(projRef(as('owner'), 'legacy'), { members: { owner: entry('owner') }, updatedAt: ts() }));
  });

  it('denies: filling in `members` for a legacy project with the wrong name or key', async () => {
    await seedProject('legacy', { ownerId: 'owner', memberIds: ['owner'] });
    await assertFails(updateDoc(projRef(as('owner'), 'legacy'), { members: { owner: entry('owner', 'Someone Else') }, updatedAt: ts() }));
    await assertFails(updateDoc(projRef(as('owner'), 'legacy'), { members: { member: entry('member') }, updatedAt: ts() }));
  });

  it('allows: the removal batch the app uses (unassign their tasks + remove them), and then they lose access', async () => {
    const db = as('owner');
    const batch = writeBatch(db);
    batch.update(taskRef(db, 'assignedToMember'), { assigneeId: null, updatedAt: ts() });
    batch.update(projRef(db), { memberIds: arrayRemove('member'), 'members.member': deleteField(), updatedAt: ts() });
    await assertSucceeds(batch.commit());
    await assertFails(getDoc(projRef(as('member'))));
    await assertFails(getDocs(tasksCol(as('member'))));
    await assertFails(addDoc(tasksCol(as('member')), newTask()));
  });

  it('allows: a newly added member can read the project and its tasks', async () => {
    await assertSucceeds(add(as('owner'), 'extra'));
    await assertSucceeds(getDoc(projRef(as('extra'))));
    await assertSucceeds(getDocs(tasksCol(as('extra'))));
  });
});

describe('creating tasks', () => {
  const create = (uid, o, pid = P) => addDoc(tasksCol(as(uid), pid), newTask({ createdBy: uid, ...o }));

  allows('a member creating a task', () => create('member'));
  allows('the owner creating a task', () => create('owner'));
  denies('an outsider creating a task', () => create('outsider'));
  denies('the owner of one project writing into another', () => create('owner', {}, 'p2'));
  denies('crediting the task to someone else', () => create('member', { createdBy: 'owner' }));
  denies('creating it already "done"', () => create('member', { status: 'done' }));
  denies('a 2-letter title', () => create('member', { title: 'ab' }));
  denies('a title of only spaces', () => create('member', { title: '     ' }));
  allows('a 120-character title', () => create('member', { title: 'x'.repeat(120) }));
  denies('a 121-character title', () => create('member', { title: 'x'.repeat(121) }));
  denies('a 1001-character description', () => create('member', { description: 'x'.repeat(1001) }));
  denies('an unknown priority', () => create('member', { priority: 'urgent' }));
  allows('assigning to a project member', () => create('member', { assigneeId: 'owner' }));
  denies('assigning to someone outside the project', () => create('member', { assigneeId: 'outsider' }));
  denies('a non-string assignee', () => create('member', { assigneeId: 42 }));
  denies('an extra field', () => create('member', { pinned: true }));
  denies('a missing field', () => addDoc(tasksCol(as('member')), without(newTask(), 'dueDate')));
  denies('a client-made createdAt', () => create('member', { createdAt: Timestamp.now() }));
  for (const good of ['2026-10-19', '2026-01-01', '2026-12-31']) allows(`due date ${good}`, () => create('member', { dueDate: good }));
  for (const bad of ['19/10/2026', '2026-13-01', '2026-00-10', '2026-10-32', '2026-10-00', '20261019', '2026-1-5', '', 20261019]) {
    denies(`due date ${JSON.stringify(bad)}`, () => create('member', { dueDate: bad }));
  }
});

describe('reading tasks', () => {
  allows('a member listing tasks', () => getDocs(tasksCol(as('member'))));
  allows('the owner reading one task', () => getDoc(taskRef(as('owner'), 'byMember')));
  denies('an outsider listing tasks', () => getDocs(tasksCol(as('outsider'))));
  denies('an outsider reading one task', () => getDoc(taskRef(as('outsider'), 'byOwner')));
  denies('the owner of p1 reading p2’s tasks', () => getDocs(tasksCol(as('owner'), 'p2')));
  denies('a collection-group query over all tasks', () => getDocs(query(collectionGroup(as('member'), 'tasks'), where('status', '==', 'todo'))));
});

describe('updating tasks', () => {
  const upd = (uid, id, data) => updateDoc(taskRef(as(uid), id), { ...data, updatedAt: ts() });

  allows('the owner editing any task', () => upd('owner', 'byMember', { title: 'Edited by owner' }));
  allows('the creator editing their task', () => upd('member', 'byMember', { title: 'Edited by creator' }));
  allows('the assignee editing the task', () => upd('member', 'assignedToMember', { description: 'My note' }));
  denies('a member editing a task they neither made nor were given', () => upd('member', 'byOwner', { title: 'Hijacked' }));
  denies('an outsider editing', () => upd('outsider', 'byOwner', { title: 'Hijacked' }));
  denies('a signed-out visitor editing', () => updateDoc(taskRef(anon(), 'byOwner'), { title: 'Hijacked', updatedAt: ts() }));

  allows('the owner changing the status', () => upd('owner', 'byMember', { status: 'done' }));
  allows('the assignee changing the status (US-06)', () => upd('member', 'assignedToMember', { status: 'in_progress' }));
  denies('the creator changing the status when not assigned', () => upd('member', 'byMember', { status: 'done' }));
  denies('a member changing the status of someone else’s task', () => upd('member', 'byOwner', { status: 'done' }));
  denies('self-assigning and changing the status in one write', () => upd('member', 'byMember', { assigneeId: 'member', status: 'done' }));
  allows('the creator assigning the task (status untouched)', () => upd('member', 'byMember', { assigneeId: 'member' }));
  denies('an unknown status', () => upd('owner', 'byOwner', { status: 'blocked' }));

  denies('assigning to a non-member', () => upd('owner', 'byOwner', { assigneeId: 'outsider' }));
  denies('changing createdBy', () => upd('owner', 'byOwner', { createdBy: 'member' }));
  denies('changing createdAt', () => upd('owner', 'byOwner', { createdAt: Timestamp.now() }));
  denies('a client-made updatedAt', () => updateDoc(taskRef(as('owner'), 'byOwner'), { title: 'Valid title', updatedAt: Timestamp.now() }));
  denies('a 2-letter title', () => upd('owner', 'byOwner', { title: 'ab' }));
  denies('an unknown priority', () => upd('owner', 'byOwner', { priority: 'urgent' }));
  denies('an invalid due date', () => upd('owner', 'byOwner', { dueDate: '2026-13-45' }));
  allows('clearing the due date', () => upd('owner', 'byOwner', { dueDate: null }));
  denies('an extra field', () => upd('owner', 'byOwner', { pinned: true }));
});

describe('deleting tasks', () => {
  allows('the owner deleting any task', () => deleteDoc(taskRef(as('owner'), 'byMember')));
  allows('the creator deleting their task', () => deleteDoc(taskRef(as('member'), 'byMember')));
  denies('an assignee who did not create it', () => deleteDoc(taskRef(as('member'), 'assignedToMember')));
  denies('a member deleting someone else’s task', () => deleteDoc(taskRef(as('member'), 'byOwner')));
  denies('an outsider deleting a task', () => deleteDoc(taskRef(as('outsider'), 'byOwner')));
  denies('a signed-out visitor deleting a task', () => deleteDoc(taskRef(anon(), 'byOwner')));

  it('known limit: tasks left behind by a deleted project can no longer be read by anyone', async () => {
    // The app deletes the tasks first; the rules can't force that, but orphaned tasks stay unreachable.
    await assertSucceeds(deleteDoc(projRef(as('owner'))));
    await assertFails(getDoc(taskRef(as('owner'), 'byOwner')));
    await assertFails(getDocs(tasksCol(as('member'))));
  });
});

describe('everything else is closed', () => {
  denies('reading an unknown collection', () => getDoc(doc(as('owner'), 'admin', 'config')));
  denies('writing an unknown collection', () => setDoc(doc(as('owner'), 'admin', 'config'), { x: 1 }));
  denies('writing an unknown subcollection of a project', () => setDoc(doc(as('owner'), 'projects', P, 'secrets', 's1'), { x: 1 }));
});
