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

  // A lookup left behind by a deleted account ('gone'), for an email that now has a new account ('reborn').
  const leftover = () => env.withSecurityRulesDisabled((ctx) =>
    setDoc(doc(ctx.firestore(), 'userEmails', email('reborn')), { uid: 'gone', displayName: 'Old Account' }));
  const signedInAs = (uid, verified) =>
    env.authenticatedContext(uid, { email: email(uid), email_verified: verified }).firestore();
  const reclaim = (db, data, key = email('reborn')) => setDoc(doc(db, 'userEmails', key), data);

  allows('a verified owner of the email taking over a leftover lookup', async () => {
    await leftover();
    return reclaim(signedInAs('reborn', true), lookup('reborn'));
  });
  denies('taking over a leftover lookup with an unverified email', async () => {
    await leftover();
    return reclaim(signedInAs('reborn', false), lookup('reborn'));
  });
  denies('taking over a leftover lookup for another uid', async () => {
    await leftover();
    return reclaim(signedInAs('reborn', true), lookup('owner'));
  });
  denies('taking over a leftover lookup with an extra field', async () => {
    await leftover();
    return reclaim(signedInAs('reborn', true), lookup('reborn', { isAdmin: true }));
  });
  denies('taking over a leftover lookup with a one-letter name', async () => {
    await leftover();
    return reclaim(signedInAs('reborn', true), lookup('reborn', { displayName: 'A' }));
  });
  denies('a verified user taking over someone else’s lookup', () =>
    reclaim(signedInAs('outsider', true), lookup('outsider'), email('member')));
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
  // Only assigned (not the creator): status updates and taking themselves off the task, nothing else.
  denies('the assignee editing the description', () => upd('member', 'assignedToMember', { description: 'My note' }));
  denies('the assignee editing the title', () => upd('member', 'assignedToMember', { title: 'Renamed by assignee' }));
  denies('the assignee changing the priority', () => upd('member', 'assignedToMember', { priority: 'high' }));
  denies('the assignee moving the due date', () => upd('member', 'assignedToMember', { dueDate: '2026-12-31' }));
  denies('the assignee handing the task to someone else', () => upd('member', 'assignedToMember', { assigneeId: 'owner' }));
  allows('the assignee taking themselves off the task', () => upd('member', 'assignedToMember', { assigneeId: null }));
  denies('the assignee changing the status and the title together', () =>
    statusUpdate('member', 'assignedToMember', 'done', { task: { title: 'Sneaky rename' } }));
  denies('a member editing a task they neither made nor were given', () => upd('member', 'byOwner', { title: 'Hijacked' }));
  denies('an outsider editing', () => upd('outsider', 'byOwner', { title: 'Hijacked' }));
  denies('a signed-out visitor editing', () => updateDoc(taskRef(anon(), 'byOwner'), { title: 'Hijacked', updatedAt: ts() }));

  allows('the owner changing the status', () => upd('owner', 'byMember', { status: 'done' }));
  allows('the assignee changing the status, telling the owner (US-06)', () => statusUpdate('member', 'assignedToMember', 'in_progress'));
  denies('the assignee changing the status without telling the owner', () => upd('member', 'assignedToMember', { status: 'in_progress' }));
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

// Activity log + notifications: entries are written in one batch with the change they describe.
const actRef = (db, pid = P) => doc(collection(db, 'projects', pid, 'activity'));
const noteRef = (db, uid, id) => (id ? doc(db, 'users', uid, 'notifications', id) : doc(collection(db, 'users', uid, 'notifications')));
const activity = (actor, o = {}) => ({
  type: 'task_created', actorId: actor, actorName: NAMES[actor], taskId: null, taskTitle: null, targetId: null,
  targetName: null, from: null, to: null, fields: null, reason: null, message: null, at: ts(), ...o,
});
const note = (actor, o = {}) => ({
  type: 'task_assigned', projectId: P, projectName: 'Website Redesign', taskId: null, taskTitle: null, actorId: actor,
  actorName: NAMES[actor], reason: null, dueDate: null, sourceId: null, status: null, message: null, at: ts(), read: false,
  response: null, ...o,
});
/** Runs fn(batch, db) as `uid` and commits. */
const inBatch = (uid, fn) => { const db = as(uid); const batch = writeBatch(db); fn(batch, db); return batch.commit(); };
const seedDoc = (path, data) => env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), ...path), data));
const REASON = 'I am on leave this week';
const addExtraToProject = () => env.withSecurityRulesDisabled((ctx) => updateDoc(projRef(ctx.firestore()), {
  memberIds: arrayUnion('extra'), 'members.extra': { displayName: NAMES.extra },
}));

/**
 * A status change the way the app sends it: the task names the owner's new notification
 * (statusNoteId), the notification and a log entry go in the same batch. `o` adjusts each part.
 */
const statusUpdate = (uid, taskId, to, o = {}) => inBatch(uid, (b, db) => {
  const ownerNote = noteRef(db, o.noteTo ?? 'owner');
  b.update(taskRef(db, taskId), { status: to, statusNoteId: o.statusNoteId ?? ownerNote.id, updatedAt: ts(), ...o.task });
  if (!o.skipNote) b.set(ownerNote, note(uid, { type: 'task_status', taskId: o.noteTaskId ?? taskId, status: to, message: o.message ?? null }));
  for (const extra of o.also ?? []) b.set(noteRef(db, extra), note(uid, { type: 'task_status', taskId, status: to, message: o.message ?? null }));
  if (o.log !== false) b.set(actRef(db), activity(uid, { type: 'task_status', taskId, from: o.from ?? 'todo', to, message: o.message ?? null }));
});

describe('leaving a project', () => {
  const leave = (db, uid) => updateDoc(projRef(db), { memberIds: arrayRemove(uid), [`members.${uid}`]: deleteField(), updatedAt: ts() });

  allows('a member leaving on their own', () => leave(as('member'), 'member'));
  denies('a member removing someone else', () => leave(as('member'), 'owner'));
  // Only their own name entry goes, but someone else's id: the id list must lose exactly the leaver.
  denies('removing another id while dropping only your own name', () => updateDoc(projRef(as('member')), {
    memberIds: arrayRemove('owner'), 'members.member': deleteField(), updatedAt: ts(),
  }));
  denies('leaving but keeping your name entry', () => updateDoc(projRef(as('member')), { memberIds: arrayRemove('member'), updatedAt: ts() }));
  denies('leaving and renaming the project in the same write', () => updateDoc(projRef(as('member')), {
    memberIds: arrayRemove('member'), 'members.member': deleteField(), name: 'Taken over', updatedAt: ts(),
  }));
  denies('an outsider "leaving" a project they are not in', () => leave(as('extra'), 'extra'));
});

describe('activity log', () => {
  allows('a member creating a task together with its entry', () => inBatch('member', (b, db) => {
    const task = doc(tasksCol(db));
    b.set(task, newTask({ createdBy: 'member' }));
    b.set(actRef(db), activity('member', { taskId: task.id, taskTitle: 'New task' }));
  }));
  denies('a "task created" entry with no task being created', () => setDoc(actRef(as('member')), activity('member', { taskId: 'byOwner' })));
  denies('an entry credited to someone else', () => inBatch('member', (b, db) => {
    const task = doc(tasksCol(db));
    b.set(task, newTask({ createdBy: 'member' }));
    b.set(actRef(db), activity('member', { taskId: task.id, actorId: 'owner' }));
  }));
  denies('an entry with a forged name', () => inBatch('member', (b, db) => {
    const task = doc(tasksCol(db));
    b.set(task, newTask({ createdBy: 'member' }));
    b.set(actRef(db), activity('member', { taskId: task.id, actorName: 'Owner Demo' }));
  }));
  denies('an entry with an extra field', () => inBatch('member', (b, db) => {
    const task = doc(tasksCol(db));
    b.set(task, newTask({ createdBy: 'member' }));
    b.set(actRef(db), { ...activity('member', { taskId: task.id }), ip: '1.2.3.4' });
  }));
  denies('an outsider writing into the log', () => setDoc(actRef(as('outsider')), activity('outsider', { type: 'project_updated', fields: ['name'] })));

  allows('the assignee changing the status with a matching entry', () => statusUpdate('member', 'assignedToMember', 'in_progress'));
  denies('a status entry that does not match the change', () => inBatch('owner', (b, db) => {
    b.update(taskRef(db, 'byOwner'), { status: 'in_progress', updatedAt: ts() });
    b.set(actRef(db), activity('owner', { type: 'task_status', taskId: 'byOwner', from: 'todo', to: 'done' }));
  }));
  denies('a message on an entry that is not a status update', () => inBatch('member', (b, db) => {
    const task = doc(tasksCol(db));
    b.set(task, newTask({ createdBy: 'member' }));
    b.set(actRef(db), activity('member', { taskId: task.id, message: 'Hello' }));
  }));
  allows('deleting a task with its entry', () => inBatch('owner', (b, db) => {
    b.delete(taskRef(db, 'byOwner'));
    b.set(actRef(db), activity('owner', { type: 'task_deleted', taskId: 'byOwner', taskTitle: 'A task' }));
  }));
  denies('a "deleted" entry for a task that still exists', () => setDoc(actRef(as('owner')), activity('owner', { type: 'task_deleted', taskId: 'byOwner' })));
  allows('the owner adding a member with its entry', () => inBatch('owner', (b, db) => {
    b.update(projRef(db), { memberIds: arrayUnion('extra'), 'members.extra': { displayName: NAMES.extra }, updatedAt: ts() });
    b.set(actRef(db), activity('owner', { type: 'member_added', targetId: 'extra', targetName: NAMES.extra }));
  }));
  denies('a member logging a project edit', () => setDoc(actRef(as('member')), activity('member', { type: 'project_updated', fields: ['name'] })));
  allows('the owner logging a project edit', () => inBatch('owner', (b, db) => {
    b.update(projRef(db), { name: 'Website Redesign 2', updatedAt: ts() });
    b.set(actRef(db), activity('owner', { type: 'project_updated', fields: ['name'] }));
  }));

  allows('the owner reading the log', () => getDocs(collection(as('owner'), 'projects', P, 'activity')));
  denies('a member reading the log', () => getDocs(collection(as('member'), 'projects', P, 'activity')));
  denies('an outsider reading the log', () => getDocs(collection(as('outsider'), 'projects', P, 'activity')));

  it('denies: editing an entry; allows: the owner deleting one', async () => {
    await seedDoc(['projects', P, 'activity', 'e1'], { ...activity('member'), at: Timestamp.now() });
    await assertFails(updateDoc(doc(as('owner'), 'projects', P, 'activity', 'e1'), { actorName: 'Someone' }));
    await assertFails(deleteDoc(doc(as('member'), 'projects', P, 'activity', 'e1')));
    await assertSucceeds(deleteDoc(doc(as('owner'), 'projects', P, 'activity', 'e1')));
  });
});

describe('notifications', () => {
  allows('notifying the person a new task is assigned to', () => inBatch('owner', (b, db) => {
    const task = doc(tasksCol(db));
    b.set(task, newTask({ createdBy: 'owner', assigneeId: 'member' }));
    b.set(noteRef(db, 'member'), note('owner', { taskId: task.id, taskTitle: 'New task' }));
  }));
  denies('notifying someone the task is not assigned to', () => inBatch('owner', (b, db) => {
    const task = doc(tasksCol(db));
    b.set(task, newTask({ createdBy: 'owner' }));
    b.set(noteRef(db, 'member'), note('owner', { taskId: task.id }));
  }));
  denies('notifying yourself', () => inBatch('member', (b, db) => {
    const task = doc(tasksCol(db));
    b.set(task, newTask({ createdBy: 'member', assigneeId: 'member' }));
    b.set(noteRef(db, 'member'), note('member', { taskId: task.id }));
  }));
  denies('a note with a forged project name', () => inBatch('owner', (b, db) => {
    const task = doc(tasksCol(db));
    b.set(task, newTask({ createdBy: 'owner', assigneeId: 'member' }));
    b.set(noteRef(db, 'member'), note('owner', { taskId: task.id, projectName: 'Payroll' }));
  }));
  denies('a note that arrives already read', () => inBatch('owner', (b, db) => {
    const task = doc(tasksCol(db));
    b.set(task, newTask({ createdBy: 'owner', assigneeId: 'member' }));
    b.set(noteRef(db, 'member'), note('owner', { taskId: task.id, read: true }));
  }));
  denies('an outsider sending a note', () => setDoc(noteRef(as('outsider'), 'member'), note('outsider', { type: 'member_added' })));
  allows('the owner notifying a member they were added', () => inBatch('owner', (b, db) => {
    b.update(projRef(db), { memberIds: arrayUnion('extra'), 'members.extra': { displayName: NAMES.extra }, updatedAt: ts() });
    b.set(noteRef(db, 'extra'), note('owner', { type: 'member_added' }));
  }));
  denies('an "added" note without adding them', () => setDoc(noteRef(as('owner'), 'extra'), note('owner', { type: 'member_added' })));
  allows('notifying the assignee that the due date moved', () => inBatch('owner', (b, db) => {
    b.update(taskRef(db, 'assignedToMember'), { dueDate: '2026-12-01', updatedAt: ts() });
    b.set(noteRef(db, 'member'), note('owner', { type: 'task_due_changed', taskId: 'assignedToMember', dueDate: '2026-12-01' }));
  }));
  allows('notifying the assignee that their task was deleted', () => inBatch('owner', (b, db) => {
    b.delete(taskRef(db, 'assignedToMember'));
    b.set(noteRef(db, 'member'), note('owner', { type: 'task_deleted', taskId: 'assignedToMember', taskTitle: 'A task' }));
  }));
  it('allows: a status update with a message, to the owner and a member the sender picked', async () => {
    await addExtraToProject();
    await assertSucceeds(statusUpdate('member', 'assignedToMember', 'done', { message: 'Shipped, please review', also: ['extra'] }));
  });
  denies('a status update sent to someone outside the project', () =>
    statusUpdate('member', 'assignedToMember', 'done', { also: ['outsider'] }));
  allows('the owner changing the status and telling the assignee (nothing required)', () => inBatch('owner', (b, db) => {
    b.update(taskRef(db, 'assignedToMember'), { status: 'done', updatedAt: ts() });
    b.set(noteRef(db, 'member'), note('owner', { type: 'task_status', taskId: 'assignedToMember', status: 'done', message: 'Closing this one' }));
  }));
  denies('a status note when the status did not change', () => inBatch('owner', (b, db) => {
    b.update(taskRef(db, 'assignedToMember'), { title: 'Same status', updatedAt: ts() });
    b.set(noteRef(db, 'member'), note('owner', { type: 'task_status', taskId: 'assignedToMember', status: 'todo' }));
  }));
  denies('a status note with a 301-character message', () =>
    statusUpdate('member', 'assignedToMember', 'done', { message: 'x'.repeat(301) }));
  denies('a message on a note that is not a status update', () => inBatch('owner', (b, db) => {
    const task = doc(tasksCol(db));
    b.set(task, newTask({ createdBy: 'owner', assigneeId: 'member' }));
    b.set(noteRef(db, 'member'), note('owner', { taskId: task.id, message: 'Hi' }));
  }));

  it('allows: the recipient reading and marking read; denies: anyone else reading it', async () => {
    await seedDoc(['users', 'member', 'notifications', 'n1'], { ...note('owner'), at: Timestamp.now() });
    await assertSucceeds(getDocs(collection(as('member'), 'users', 'member', 'notifications')));
    await assertFails(getDocs(collection(as('owner'), 'users', 'member', 'notifications')));
    await assertFails(updateDoc(noteRef(as('member'), 'member', 'n1'), { actorName: 'Someone' }));
    await assertSucceeds(updateDoc(noteRef(as('member'), 'member', 'n1'), { read: true }));
  });

  it('denies: declining a note that can\'t be declined, or declining twice', async () => {
    await seedDoc(['users', 'owner', 'notifications', 'n1'], { ...note('member', { type: 'task_done' }), at: Timestamp.now() });
    await assertFails(updateDoc(noteRef(as('owner'), 'owner', 'n1'), { read: true, response: 'declined' }));
    await seedDoc(['users', 'member', 'notifications', 'n2'], { ...note('owner', { response: 'declined', read: true }), at: Timestamp.now() });
    await assertFails(updateDoc(noteRef(as('member'), 'member', 'n2'), { response: 'accepted' }));
  });

  // The decline batch the app uses: unassign + log + tell the assigner + answer the original note.
  const declineTask = (reason, recipient = 'owner') => inBatch('member', (b, db) => {
    b.update(taskRef(db, 'assignedToMember'), { assigneeId: null, updatedAt: ts() });
    b.set(actRef(db), activity('member', { type: 'task_declined', taskId: 'assignedToMember', reason }));
    b.set(noteRef(db, recipient), note('member', { type: 'task_declined', taskId: 'assignedToMember', reason, sourceId: 'src' }));
    b.update(noteRef(db, 'member', 'src'), { read: true, response: 'declined' });
  });
  const seedSource = () => seedDoc(['users', 'member', 'notifications', 'src'], { ...note('owner', { taskId: 'assignedToMember' }), at: Timestamp.now() });

  it('allows: declining an assigned task with a reason', async () => {
    await seedSource();
    await assertSucceeds(declineTask(REASON));
  });
  it('denies: declining with a reason that is too short or too long', async () => {
    await seedSource();
    await assertFails(declineTask('no'));
    await assertFails(declineTask('x'.repeat(301)));
  });
  it('denies: sending the decline to someone who did not assign the task', async () => {
    await seedSource();
    await assertFails(declineTask(REASON, 'extra'));
  });

  // Leaving after declining a project: unassign + leave + log + tell the owner + answer the invitation.
  const leaveProject = async (reason) => {
    await seedDoc(['users', 'member', 'notifications', 'invite'], { ...note('owner', { type: 'member_added' }), at: Timestamp.now() });
    return inBatch('member', (b, db) => {
      b.update(taskRef(db, 'assignedToMember'), { assigneeId: null, updatedAt: ts() });
      b.update(projRef(db), { memberIds: arrayRemove('member'), 'members.member': deleteField(), updatedAt: ts() });
      b.set(actRef(db), activity('member', { type: 'member_left', reason }));
      b.set(noteRef(db, 'owner'), note('member', { type: 'member_left', reason }));
      b.update(noteRef(db, 'member', 'invite'), { read: true, response: 'declined' });
    });
  };
  allows('declining a project: leaving with a reason, logged and sent to the owner', () => leaveProject(REASON));
  denies('declining a project without a reason', () => leaveProject(''));
  it('denies: a "left" note while still a member', () =>
    assertFails(setDoc(noteRef(as('member'), 'owner'), note('member', { type: 'member_left', reason: REASON }))));
});

describe('status updates must tell the owner', () => {
  allows('the assignee with the owner notified (statusNoteId points at it)', () => statusUpdate('member', 'assignedToMember', 'done'));
  denies('the assignee naming a notification that is never written', () =>
    statusUpdate('member', 'assignedToMember', 'done', { skipNote: true }));
  it('denies: the assignee sending the required note to another member instead of the owner', async () => {
    await addExtraToProject();
    await assertFails(statusUpdate('member', 'assignedToMember', 'done', { noteTo: 'extra' }));
  });
  denies('the required note being about another task', () =>
    statusUpdate('member', 'assignedToMember', 'done', { noteTaskId: 'byOwner' }));
  it('denies: reusing the notification of an earlier status change', async () => {
    await seedDoc(['users', 'owner', 'notifications', 'old'], { ...note('member', { type: 'task_status', taskId: 'assignedToMember', status: 'in_progress' }), at: Timestamp.now() });
    await env.withSecurityRulesDisabled((ctx) => updateDoc(taskRef(ctx.firestore(), 'assignedToMember'), { statusNoteId: 'old' }));
    await assertFails(statusUpdate('member', 'assignedToMember', 'done', { statusNoteId: 'old', skipNote: true }));
  });
  // Telling the owner doesn't grant the right: only the assignee (or the owner) changes the status.
  denies('the creator (not assigned) changing the status even with the owner notified', () =>
    statusUpdate('member', 'byMember', 'done'));
  denies('a member changing someone else’s task status even with the owner notified', () =>
    statusUpdate('member', 'byOwner', 'done'));
  denies('creating a task that already names a status note', () =>
    addDoc(tasksCol(as('member')), { ...newTask({ createdBy: 'member' }), statusNoteId: 'n1' }));
  allows('the owner changing the status with no notification at all', () =>
    updateDoc(taskRef(as('owner'), 'assignedToMember'), { status: 'done', updatedAt: ts() }));
});

// Per-member permissions: projects/{id}/memberPerms/{uid} = { perms, updatedAt }. No document = contributor.
const permsRef = (db, uid, pid = P) => doc(db, 'projects', pid, 'memberPerms', uid);
const grant = (uid, perms) => seedDoc(['projects', P, 'memberPerms', uid], { perms, updatedAt: Timestamp.now() });
const ALL_PERMS = ['create', 'edit', 'dueDate', 'assign', 'status', 'delete'];

describe('member permissions (who sets them)', () => {
  allows('the owner giving a member permissions', () => setDoc(permsRef(as('owner'), 'member'), { perms: ['edit', 'dueDate'], updatedAt: ts() }));
  allows('the owner giving a member every permission', () => setDoc(permsRef(as('owner'), 'member'), { perms: ALL_PERMS, updatedAt: ts() }));
  allows('the owner making a member a viewer (no permissions)', () => setDoc(permsRef(as('owner'), 'member'), { perms: [], updatedAt: ts() }));
  denies('a member giving themselves permissions', () => setDoc(permsRef(as('member'), 'member'), { perms: ALL_PERMS, updatedAt: ts() }));
  denies('permissions for the owner', () => setDoc(permsRef(as('owner'), 'owner'), { perms: [], updatedAt: ts() }));
  denies('permissions for someone outside the project', () => setDoc(permsRef(as('owner'), 'outsider'), { perms: ['edit'], updatedAt: ts() }));
  denies('an unknown permission', () => setDoc(permsRef(as('owner'), 'member'), { perms: ['admin'], updatedAt: ts() }));
  denies('the same permission twice', () => setDoc(permsRef(as('owner'), 'member'), { perms: ['edit', 'edit'], updatedAt: ts() }));
  denies('an extra field', () => setDoc(permsRef(as('owner'), 'member'), { perms: [], role: 'admin', updatedAt: ts() }));
  allows('adding a member with permissions in one batch', () => inBatch('owner', (b, db) => {
    b.update(projRef(db), { memberIds: arrayUnion('extra'), 'members.extra': { displayName: NAMES.extra }, updatedAt: ts() });
    b.set(permsRef(db, 'extra'), { perms: ['create', 'status'], updatedAt: ts() });
  }));
  it('allows: a member reading their own; denies: reading someone else\'s or listing them', async () => {
    await grant('member', ['edit']);
    await seedDoc(['projects', P, 'memberPerms', 'other'], { perms: [], updatedAt: Timestamp.now() });
    await assertSucceeds(getDoc(permsRef(as('member'), 'member')));
    await assertFails(getDoc(permsRef(as('member'), 'other')));
    await assertFails(getDocs(collection(as('member'), 'projects', P, 'memberPerms')));
    await assertSucceeds(getDocs(collection(as('owner'), 'projects', P, 'memberPerms')));
    await assertFails(getDoc(permsRef(as('outsider'), 'member')));
  });
  it('allows: the owner deleting them; denies: a member deleting their own', async () => {
    await grant('member', ['edit']);
    await assertFails(deleteDoc(permsRef(as('member'), 'member')));
    await assertSucceeds(deleteDoc(permsRef(as('owner'), 'member')));
  });
});

describe('member permissions (what they allow on tasks)', () => {
  const upd = (id, data) => updateDoc(taskRef(as('member'), id), { ...data, updatedAt: ts() });

  it('denies: a viewer creating a task; allows: the same member once given "create"', async () => {
    await grant('member', []);
    await assertFails(addDoc(tasksCol(as('member')), newTask({ createdBy: 'member' })));
    await grant('member', ['create']);
    await assertSucceeds(addDoc(tasksCol(as('member')), newTask({ createdBy: 'member' })));
  });
  it('allows: a viewer still managing a task they created earlier, and updating a task assigned to them', async () => {
    await grant('member', []);
    await assertSucceeds(upd('byMember', { title: 'Still mine' }));
    await assertSucceeds(statusUpdate('member', 'assignedToMember', 'in_progress'));
  });
  it('"edit": details of any task, but not its due date, assignee or status', async () => {
    await grant('member', ['edit']);
    await assertSucceeds(upd('byOwner', { title: 'Edited with permission', priority: 'high' }));
    await assertFails(upd('byOwner', { dueDate: '2026-12-01' }));
    await assertFails(upd('byOwner', { assigneeId: 'member' }));
    await assertFails(statusUpdate('member', 'byOwner', 'done'));
  });
  it('"dueDate": the due date of any task, nothing else', async () => {
    await grant('member', ['dueDate']);
    await assertSucceeds(upd('byOwner', { dueDate: '2026-12-01' }));
    await assertFails(upd('byOwner', { title: 'Not allowed' }));
  });
  it('"assign": hand any task to a member', async () => {
    await assertFails(upd('byOwner', { assigneeId: 'member' }));
    await grant('member', ['assign']);
    await assertSucceeds(upd('byOwner', { assigneeId: 'member' }));
  });
  it('"status": change the status of any task (still telling the owner)', async () => {
    await grant('member', ['status']);
    await assertSucceeds(statusUpdate('member', 'byOwner', 'done'));
    await assertFails(upd('byOwner', { status: 'in_progress' })); // without telling the owner
  });
  it('"delete": delete any task', async () => {
    await assertFails(deleteDoc(taskRef(as('member'), 'byOwner')));
    await grant('member', ['delete']);
    await assertSucceeds(deleteDoc(taskRef(as('member'), 'byOwner')));
  });
  it('denies: permissions left behind after a member leaves', async () => {
    await grant('member', ALL_PERMS);
    await env.withSecurityRulesDisabled((ctx) => updateDoc(projRef(ctx.firestore()), { memberIds: ['owner'], 'members.member': deleteField() }));
    await assertFails(deleteDoc(taskRef(as('member'), 'byOwner')));
    await assertFails(addDoc(tasksCol(as('member')), newTask({ createdBy: 'member' })));
  });
});

describe('member permissions (log and notifications)', () => {
  allows('changing permissions with a log entry and a note to the member', () => inBatch('owner', (b, db) => {
    b.set(permsRef(db, 'member'), { perms: ['create', 'edit'], updatedAt: ts() });
    b.set(actRef(db), { ...activity('owner', { type: 'member_perms', targetId: 'member', targetName: NAMES.member }), perms: ['create', 'edit'] });
    b.set(noteRef(db, 'member'), { ...note('owner', { type: 'perms_changed' }), perms: ['create', 'edit'] });
  }));
  denies('a permissions entry that does not match what was saved', () => inBatch('owner', (b, db) => {
    b.set(permsRef(db, 'member'), { perms: ['create'], updatedAt: ts() });
    b.set(actRef(db), { ...activity('owner', { type: 'member_perms', targetId: 'member', targetName: NAMES.member }), perms: ALL_PERMS });
  }));
  denies('a permissions note that does not match what was saved', () => inBatch('owner', (b, db) => {
    b.set(permsRef(db, 'member'), { perms: ['create'], updatedAt: ts() });
    b.set(noteRef(db, 'member'), { ...note('owner', { type: 'perms_changed' }), perms: ALL_PERMS });
  }));
  denies('a perms field on any other kind of entry', () => inBatch('member', (b, db) => {
    const task = doc(tasksCol(db));
    b.set(task, newTask({ createdBy: 'member' }));
    b.set(actRef(db), { ...activity('member', { taskId: task.id }), perms: ['edit'] });
  }));
  allows('adding a member with their permissions in the log entry and the note', () => inBatch('owner', (b, db) => {
    b.update(projRef(db), { memberIds: arrayUnion('extra'), 'members.extra': { displayName: NAMES.extra }, updatedAt: ts() });
    b.set(permsRef(db, 'extra'), { perms: ['create'], updatedAt: ts() });
    b.set(actRef(db), { ...activity('owner', { type: 'member_added', targetId: 'extra', targetName: NAMES.extra }), perms: ['create'] });
    b.set(noteRef(db, 'extra'), { ...note('owner', { type: 'member_added' }), perms: ['create'] });
  }));
});

describe('everything else is closed', () => {
  denies('reading an unknown collection', () => getDoc(doc(as('owner'), 'admin', 'config')));
  denies('writing an unknown collection', () => setDoc(doc(as('owner'), 'admin', 'config'), { x: 1 }));
  denies('writing an unknown subcollection of a project', () => setDoc(doc(as('owner'), 'projects', P, 'secrets', 's1'), { x: 1 }));
});
