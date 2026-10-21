// Proves the rules tests have teeth: breaks firestore.rules on purpose, one way at a time, and checks that
// `npm run test:rules` fails each time. Run it with: npm run test:rules:mutations  (about 6 minutes)
// The real firestore.rules is never modified; each broken copy goes to the temp folder (RULES_FILE).
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const original = readFileSync(join(ROOT, 'firestore.rules'), 'utf8');

const mutations = [
  ['a member can edit the project', 'allow update: if signedIn() && isOwner()', 'allow update: if signedIn()'],
  ['anyone can change a task status', "&& (!changed().hasAny(['status']) || ownsProject() || isAssignee() || can('status'))", '&& true'],
  ['emails can be listed', 'allow list: if false;', 'allow list: if signedIn();'],
  ['member names can be forged', '&& entry.displayName == get(/databases/$(database)/documents/users/$(uid)).data.displayName;', '&& true;'],
  ['any month is accepted in due dates', '(0[1-9]|1[0-2])', '[0-9]{2}'],
  ['task createdBy can be changed', '&& request.resource.data.createdBy == resource.data.createdBy', '&& true'],
  ['a member can delete any task', "allow delete: if ownsProject() || (inProject() && isCreator()) || can('delete');", 'allow delete: if inProject();'],
  ['an outsider can read tasks', 'allow read: if inProject();', 'allow read: if signedIn();'],
  ['an unverified email can take over a lookup', '|| (request.auth.token.email_verified == true', '|| (true'],
  ['a member can read the activity log', 'allow read: if signedIn() && ownerActs();', 'allow read: if signedIn();'],
  ['log entries need not match a real change', '&& entry().at == request.time\n          && matchesChange();', '&& entry().at == request.time;'],
  ['anyone can be sent any notification', '&& note().response == null\n          && matchesChange();', '&& note().response == null;'],
  ['a decline can be sent to anyone', '\n                && answersAssignment())', ')'],
  ['a status change need not tell the owner', '|| ownsProject() || ownerNotified());', '|| true);'],
  ['a status update can go to someone outside the project', "(type == 'task_status' && hasTask() && uid in projectBefore().memberIds", "(type == 'task_status' && hasTask()"],
  ['anyone can edit task details', "&& mayChange(['title', 'description', 'priority'], 'edit')", ''],
  ['due dates ignore permissions', "&& mayChange(['dueDate'], 'dueDate')", ''],
  ['creating tasks ignores permissions', "&& (ownsProject() || can('create'))", ''],
  ['a member can grant themselves permissions', 'allow create, update: if signedIn() && ownerActs()', 'allow create, update: if signedIn()'],
  ['"leaving" can remove other members', 'request.resource.data.memberIds == resource.data.memberIds.removeAll([request.auth.uid])', 'true'],
];

const clean = (s) => s.replace(/\x1b\[[0-9;]*m/g, '');
let missed = 0;
for (const [name, from, to] of mutations) {
  if (!original.includes(from)) {
    console.log(`?  ${name}: pattern not found, update this script`);
    missed += 1;
    continue;
  }
  const file = join(tmpdir(), 'taskflow-mutated.rules');
  writeFileSync(file, original.replace(from, to));
  const run = spawnSync('npm run test:rules', { cwd: ROOT, shell: true, encoding: 'utf8', env: { ...process.env, RULES_FILE: file } });
  const out = clean((run.stdout || '') + (run.stderr || ''));
  const failed = Number((out.match(/^ℹ fail (\d+)/m) || [])[1] ?? 0);
  const caught = failed > 0;
  if (!caught) missed += 1;
  console.log(`${caught ? 'caught' : 'MISSED'}  ${name} (${failed} failing test${failed === 1 ? '' : 's'})`);
}
console.log(missed ? `\n${missed} mutation(s) were NOT caught` : '\nAll mutations were caught');
process.exit(missed ? 1 : 0);
