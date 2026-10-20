# TaskFlow security notes

TaskFlow has no backend: the browser talks to Firebase directly, so **Firestore Security Rules
(`firestore.rules`) are the only enforcement**. Hiding a button is never treated as protection; every
permission in the UI (`src/lib/permissions.js`) is a mirror of a rule.

## Who can do what

| | Signed out | Outsider (signed in, not in the project) | Member | Owner |
|---|---|---|---|---|
| Own profile (`users/{uid}`) | no | read / rename own | read / rename own | read / rename own |
| Email lookup (`userEmails/{email}`) | no | `get` one (never list) | `get` one | `get` one |
| Project | no | no (404 vs 403 is distinguishable, no data) | read | read, edit name/description, delete |
| Members | no | no | read names; **leave** (remove only themselves) | add one existing user by email, remove one (not the owner), max 20 |
| Tasks: read | no | no | yes | yes |
| Tasks: create | no | no | yes (credited to self, starts as `todo`) | yes |
| Tasks: edit | no | no | only ones they created or are assigned to | any |
| Tasks: change status | no | no | only on tasks assigned to them | any |
| Tasks: delete | no | no | only ones they created | any |
| Activity log (`projects/{id}/activity`) | no | no | write entries for their own changes; **can't read** | read; delete (used when deleting the project) |
| Notifications (`users/{uid}/notifications`) | no | no | send one only as part of the change it reports; read / mark read / decline / delete **their own** | same |

Everything not listed is denied (`match /{document=**} { allow read, write: if false; }`), including
collection-group queries over all tasks.

## Hardening decisions

- **Deny by default**, then open each path narrowly.
- **Fields are validated, not just permissions**: exact allowed keys on every create, types and lengths
  (project name 3–80, task title 3–120, descriptions ≤ 1000, display name 2–60), enumerated `status` and
  `priority`, due date as `YYYY-MM-DD` with a real month and day.
- **Immutable fields**: `ownerId`, `createdAt`, `createdBy`, a user's `email`.
- **Server time**: `createdAt` / `updatedAt` must equal `request.time` (a client can't back-date).
- **Membership is one change at a time**: add exactly one user that has a profile, or remove exactly one
  non-owner. The owner can't be removed and `members` always has exactly the keys of `memberIds`.
- **Names can't be forged**: a name written into `projects/{id}.members` must equal that user's own
  `users/{uid}.displayName`.
- **Status needs the *current* assignee**: self-assigning and changing the status in one write is rejected
  (the check uses the stored assignee, not the one being written).
- **Removing a member revokes access immediately** (read/list/create on the project and its tasks fail
  on the next request, and open pages flip to "access denied").
- **Privacy**: `users/{uid}` is private. Members see each other's names only through the project's own
  `members` map. `userEmails` can only be read one document at a time, so emails can't be dumped.
- **Email lookups can't be hijacked**: only the account whose sign-in email *is* that email can write its
  lookup. A lookup left behind by a deleted account can be taken over by the email's new account only
  with a **verified** email (e.g. Google sign-in), because Firebase allows one account per email.
- **Activity log entries describe real changes**: each entry is written in the same batch as the change
  and the rules compare the two with `get()` (before) and `getAfter()` (after): a "status" entry must
  match the task's old and new status, a "deleted" entry needs the task to be gone afterwards, a "member
  added" entry needs that person in `memberIds` afterwards, and so on. The actor is always the signed-in
  user, with the name stored for them in the project. Entries can't be edited. Only the owner reads the log.
- **Notifications can't be spammed or forged**: a notification can only be created by a project member,
  never to themselves, with `read: false`, and only alongside the change it reports (e.g. "assigned to you"
  needs the task's `assigneeId` to become the recipient in the same batch). Only the recipient can read it.
  They can mark it read, answer "declined" **once** (only on an assignment or an invitation), or delete it.
- **Declining**: declining a task unassigns it and notifies the person who assigned it; the rules check the
  decliner was the assignee and that the original "assigned" notification really came from that person.
  Declining a project means leaving it: a member may remove **only themselves** (never the owner, never
  someone else, nothing else in the same write). Reasons are required, 3–300 characters.
- **No secrets in the repo**: the Firebase web config is public by design (`.env.example` lists names
  only); no service-account key exists anywhere.

## Known limitations (deliberate, for the MVP)

1. **Email enumeration**: "add member by email" needs a lookup, so any signed-in user can check whether
   a *specific* email is registered (and see its display name). They can't list emails.
2. **Orphaned tasks**: Firestore never deletes subcollections. The app deletes a project's tasks first;
   rules can't force that, but if a project document is deleted without it the leftover tasks are
   unreachable for everyone (tested), and no data is exposed.
3. **Un-assigning on removal is done by the client** (one atomic batch with the removal). The rules
   don't force it; a task still assigned to a removed member must be re-assigned the next time it is edited.
4. **A creator can assign their own task to themselves and then change its status**, in two separate
   writes (assigning is an edit they're allowed to make; doing both in one write is rejected). Closing this
   would mean taking away the creator's right to assign.
5. **Date check is "shaped", not calendar-exact**: `2026-02-31` passes (month 01–12, day 01–31).
6. **No quotas**: nothing limits how many projects or tasks one user can create, beyond Firebase's own limits.
7. **Emails aren't verified**: registration doesn't require email verification (not in the SRS).
8. **Names are snapshots**: a member's name in a project is copied when they're added; there is no
   profile editing in the app, so they can't go stale in practice.
9. **The log can be skipped, not forged**: the rules check that every entry matches a real change, but they
   can't force a change to come *with* an entry (that needs a server, e.g. Cloud Functions on the paid
   plan). A modified client could make a change it's allowed to make without logging it; it can't log a
   change that didn't happen or write as someone else. The same goes for notifications.
10. **The owner can delete log entries** (the app does it only when deleting the project). The owner is the
   only reader, so this can only hide entries from themselves.
11. **Notifications outlive their project**: they stay in the recipient's list after a project is deleted
   or they leave it; opening one then shows "not found" / "access denied", with no project data.

## How to test the rules

```bash
npm run test:rules
```

Starts the Firestore emulator, runs `tests/rules.test.js` against `firestore.rules` and shuts it down. It
never touches the real project. It needs **Java 21 or newer** on the PATH (current `firebase-tools`
refuses older versions and prints an error). The first run downloads the emulator (about 60–70 MB) into
`~/.cache/firebase/emulators`. Deploy the rules with `npm run deploy:rules`.

## Test results

**Automated (`npm run test:rules`): 203 tests in 15 groups, 203 pass.** Every group tests what must be
*allowed* and what must be *denied*, for the owner, a member, an outsider and a signed-out visitor:

| Group | What it covers |
|---|---|
| Signed-out visitors | nothing readable or writable |
| `users/{uid}` | own profile only; no listing; field and name validation; email/`createdAt` immutable |
| `userEmails/{email}` | one lookup at a time, no listing; can only register / rename your own email; a verified email takes over a leftover lookup, an unverified one can't |
| Reading projects | members yes, outsiders no (TC-13), 404 vs 403, filtered listing only |
| Creating projects | owner is the creator, exact fields, name/description limits, server timestamps, real profile name |
| Updating / deleting projects | owner only (TC-06), immutable `ownerId` / `createdAt`, validation |
| Membership | add one real user with their real name, remove one non-owner, max 20, legacy backfill, removal batch and instant loss of access |
| Creating tasks | members only, credited to self, starts `todo`, assignee must be a member, every field limit, 12 due-date cases |
| Reading tasks | members only, no cross-project reads, no collection-group query |
| Updating tasks | owner / creator / assignee, status rules (US-06), no self-assign-and-complete in one write, immutable fields |
| Deleting tasks | owner or creator only; orphaned tasks stay unreachable |
| Leaving a project | a member removes only themselves (id and name), nothing else in the same write; outsiders can't |
| Activity log | each entry must match the change in its batch (created / status / assigned / deleted / member added / left…), actor and name can't be forged, no extra fields, owner-only reads, no edits |
| Notifications | only alongside the change they report, never to yourself, arrive unread, recipient-only reads, read / decline once, the decline must answer a real assignment from that person, the full decline and leave batches |
| Everything else | unknown collections and subcollections are closed |

**The tests themselves are tested** (`npm run test:rules:mutations`): the rules are broken on purpose in 14
ways (a member can edit the project, anyone can change a status, emails can be listed, names can be
forged, any month is accepted, `createdBy` can be changed, a member can delete any task, an outsider can
read tasks, an unverified email can take over a lookup, a member can read the activity log, log entries need not match a
real change, anyone can be sent any notification, a decline can be sent to anyone, "leaving" can remove other
members) and the suite must fail each time. **All 14 are caught** (the last one only after adding a test aimed at
it: the first run showed the existing tests didn't cover it), each by the tests named after that
behaviour (1 to 5 failing tests per break), so a passing run isn't just tests that can't fail.

**Against the real project (hardened rules deployed):** a script using the app's own services created a
project, added a member by email, created and updated a task, was refused an invalid due date
(`2026-13-45`), removed the member (their task was un-assigned in the same batch) and deleted the project:
7 of 7 steps behaved as expected.
