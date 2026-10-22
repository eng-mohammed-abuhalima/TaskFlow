# TaskFlow — project context for Claude Code

## What it is

A bilingual (English LTR / Arabic RTL) project & task management web app for small software teams.
It is the TAQAT / CodeMap 7-day full-stack challenge. Full spec: `docs/TaskFlow_SRS.docx`.
The developer is Mohammed. Talk to him in Arabic (Palestinian dialect is fine); keep code, comments,
commit messages and UI copy in English (Arabic UI strings in Modern Standard Arabic).

## Decided stack (overrides the SRS where they differ)

- React + Vite (JavaScript, `--template react`), NOT Next.js.
  Note: the SRS rubric gives Next.js 15/100 points; Mohammed is confirming with the instructor.
- Tailwind CSS v4 via `@tailwindcss/vite`, CSS-first config (`@theme` in `src/index.css`, no tailwind.config.js).
  Plain CSS only when Tailwind can't do it.
- React Router (`react-router-dom`).
- Firebase Authentication (email/password) + Cloud Firestore. No backend. Security is enforced by Firestore Rules.
- lucide-react icons; Radix Select / Popover / Direction + react-day-picker + date-fns for pickers.
- Fonts via @fontsource: IBM Plex Sans + IBM Plex Sans Arabic (UI), Readex Pro (headings).

## Design system = source of truth for all UI

Copied into `docs/` (original lives as a private claude.ai artifact; there is no README.md copy).

- Read `docs/01-setup.md` (install, vite.config, index.html no-flash script, main.jsx, usePreferences hook,
  cx/variants, icons, dates, full index.css), then `docs/02-color.md` and `docs/03-rtl-and-accessibility.md`.
  Tokens: `docs/tokens.json`.
- `docs/index.css` = the complete `src/index.css` (already in place; same content, reformatted).
- Component sources: `docs/components/src/` (components, lib, screens, demos). `components/` and `lib/` are
  already copied to `src/`; `screens/` are demo screens with fake data, use them as layout references for pages.
  Per-component guidelines: `docs/components/<Name>/README.md`. Types: `docs/components/index.d.ts`.
- In `src/`, `ProjectCard` and `Navbar` use React Router `<Link>` instead of `<a href>`; Navbar takes `onLogout`.
- Hard rules: semantic tokens only (`bg-surface`, `text-fg`, `bg-primary text-on-primary`…; Tailwind's default
  palette is wiped). Logical utilities only (`ms-/me-/ps-/pe-/start-/end-/text-start`; never ml/mr/pl/pr/left/right).
  No `dark:` variants (themes swap CSS variables via `data-theme` on <html>). `focus-ring` on every control.
  Status/priority never by colour alone (icon + label). Western digits in both languages (`ar-u-nu-latn`).
- Theme/lang: `data-theme`, `lang`, `dir` on <html>; saved in localStorage keys `tf-theme`, `tf-lang`.

## Pages (routes)

1. `/` — signed in → /dashboard; visitors see the landing page (`pages/Landing.jsx`, lazy-loaded)
2. `/register` — name, email, password; creates Auth user + `users/{uid}`
3. `/login` — email/password; session persists on refresh
4. `/dashboard` — stat cards (projects, total tasks, by status, overdue), project cards, overdue list
5. `/projects/new` — name (3–80, required), description (optional, ≤1000)
6. `/projects/:id` — members, FilterBar (search title + status/priority/assignee), task list, create/edit/delete task
7. `/projects/:id/settings` — owner only: edit project, add/remove members by email, delete project (DangerZone)
   Also needed (not in SRS): task edit modal, shared 404 / Access Denied page (`StatePage`), shared Navbar.
   Non-members opening a project URL must get Access Denied with no data shown.

## Firestore data model

- `users/{uid}`: displayName, email, createdAt
- `userEmails/{emailLowercase}`: { uid } — lookup for "add member by email" without exposing all user profiles
- `projects/{projectId}`: name, description, ownerId, memberIds[] (includes ownerId), createdAt, updatedAt
- `projects/{projectId}/tasks/{taskId}`: title (3–120), description (≤1000), status (todo|in_progress|done, default todo),
  priority (low|medium|high), assigneeId|null (must be a member), createdBy, dueDate|null as "YYYY-MM-DD" string,
  createdAt, updatedAt (serverTimestamp)

## Permissions (enforce in firestore.rules, not just UI)

- Owner: everything in the project.
- Member: read project + tasks; create tasks (createdBy = self); edit tasks they created (on tasks they are ONLY
  assigned to: status update or unassigning themselves); the owner can grant more per member (Member permissions);
  delete only tasks they created; change status only on tasks assigned to them.
- Only the owner edits/deletes the project and manages members. Removing a member revokes access and
  unassigns their tasks. Deleting a project must delete its tasks subcollection (Firestore won't) or be blocked.

## Key decisions / gotchas

- Dashboard: fetch tasks per accessible project and aggregate client-side (avoid collectionGroup for MVP).
- Overdue = dueDate < today AND status != done, where today = `todayISO()` in `Asia/Hebron`
  (see `components/src/lib/i18n.js`). Never use `new Date().toISOString()` for "today" (that is UTC).
- Env vars: Vite uses `VITE_` prefix, read via `import.meta.env`. Real values in `.env.local` (git-ignored by
  Vite's `*.local`); commit `.env.example` with names only. Firebase web config is not secret; never add a
  service-account key anywhere.
- Commits: small and meaningful (`feat: …`, `fix: …`, `chore: …`); the rubric grades commit history.
- Priority if time runs short (SRS): auth → project CRUD → task CRUD → security rules → responsive →
  assignment/filtering → bonus. Skip the TileBoard animation and custom date picker first if needed.

## Status

- Done: SRS reviewed; design system finished (with timezone fix); Vite + deps scaffolded and pushed to GitHub;
  setup from `01-setup.md` (usePreferences, lib, components in `src/`, App with DirectionProvider + routes
  using placeholder pages and a 404 `StatePage`).
- Phased plan: `docs/ROADMAP.md` (Arabic). Work one phase at a time, only when Mohammed says to start it,
  and tick its checkboxes when done.
- Firebase project `taskflow-be3db` (linked in `.firebaserc`). Phases 1–2 done: auth, route guards,
  `AuthContext` + `PreferencesContext` (use `usePrefs()` for t/lang/theme), users/userEmails rules deployed.
  Test account credentials live in git-ignored `test-accounts.local`; never print them.
- Phase 3 done: projects CRUD (`services/projects.js`, `useProject` + `ProjectStatusView` for 404/403,
  `ToastContext` → `useToast()`, `ProjectForm`, `Breadcrumb`). Wrap user-entered text in the `user-text`
  utility (unicode-bidi: plaintext for punctuation, alignment pinned to the page direction so English text in
  the Arabic UI doesn't drift to the wrong edge of its cell) instead of setting `dir`.
  Logout goes through `useAuth().logout`.
- Phase 4 done: tasks CRUD (`services/tasks.js` live via onSnapshot, `useTasks`, `TaskFormModal`,
  `lib/permissions.js` mirrors the task rules — keep them in sync). New tasks always start as `todo`.
  `Modal` wraps content in `PortalScope` so Radix popups inside a `<dialog>` stay clickable.
- Phase 5 done: membership. `projects/{id}.members = { uid: { displayName } }` mirrors `memberIds` (that is how
  members see each other's names; `users/{uid}` stays private). `userEmails/{email}` = `{ uid, displayName }`.
  `services/members.js` (add by email / remove + unassign tasks in one batch), `lib/members.js`
  (`projectMembers`), `useProject` is live (`onSnapshot`). Test members are added/removed through the UI.
- TileBoard intro is wired into `AuthLayout` (board on lg+, band card below). It plays once per page load;
  `TileBoard` takes `instant` to render the finished board (used when switching Sign in <-> Create account).
- Phase 6 done: `lib/filterTasks.js` (pure, AND-combined filters incl. overdue) + `FilterBar` on the project page;
  real dashboard (`useDashboard` loads projects + their tasks, `lib/taskStats.js` aggregates client-side,
  `components/dashboard/{StatusBreakdown,OverdueList}`). FilterBar members are `[{ uid, name }]`.
- Phase 7 done: hardened rules + emulator tests (298 after the board rank; 26 mutations) (`npm run test:rules`, needs Java 21+; `tests/rules.test.js`), a
  mutation check that proves the tests catch broken rules (`npm run test:rules:mutations`), `docs/SECURITY.md`.
  Rule names written into `projects.members` must equal the user's own `users/{uid}.displayName`.
- Phase 8 done: offline = refuse to save with a clear error (`lib/network.js` `guardedWrite`, wrap every Firestore
  write in services with it; `writeErrorMessage` for the text), `OfflineBanner`, `ErrorBoundary`, `usePageTitle` on every
  page, `AppLayout` owns `<main id="main">` + skip link + focus on navigation (pages render a `div`, never their own `main`).
  Stat cards are not headings. Verified across 3 sizes x 2 languages x 2 themes.
- Phase 9 done: live at https://taskflow-be3db.web.app (Firebase Hosting; `firebase.json` `hosting` has the SPA
  rewrite, cache and security headers). Redeploy with `npm run deploy` (needs `.env.local` to build). Demo data (SRS
  Appendix A) is in Firestore: owner + member on "Website Redesign 2026", a second owner-only "Mobile App" project.
- State on 2026-10-21: phases 0–9 done and pushed to GitHub (52 commits, nothing local); Mohammed verified login on the
  live site. React + Vite is confirmed fine by the instructor (no Next.js migration). Never type passwords into the
  live site; test login there by hand.
- Added on 2026-10-21 (Mohammed's requests): Remember me (IndexedDB vs session persistence), `/forgot-password`,
  favicon, autofill colours, delayed full-page spinner, new sign-in intro story (`BrandPanel` in AuthLayout),
  Google sign-in (`GoogleSignIn`, provider enabled in Console; first sign-in writes the same profile + lookup).
  A verified email may take over a `userEmails` lookup left by a deleted account (rules deployed, tests pass).
  Machine: JDK 21 at `C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot`; JAVA_HOME still points at 17, so set
  JAVA_HOME/PATH for the test command only. Apple sign-in dropped (Mohammed: Google only).
  Activity log (owner-only `projects/{id}/activity`, Activity tab) + notifications (`users/{uid}/notifications`, bell in
  Navbar) + decline with reason (task: unassign + tell the assigner; project: leave + tell the owner). Every entry
  and notification goes in the SAME writeBatch as its change; rules check it with get/getAfter. Services take
  `(project, …, uid)`: createTask/updateTask/deleteTask, addMemberByEmail, removeMember, updateProject.
  Member permissions: `projects/{id}/memberPerms/{uid}` = { perms, updatedAt }, perms ⊆ create/edit/dueDate/assign/
  status/delete (each on ANY task). Templates viewer/contributor/manager/custom (`lib/permissions.js` PRESETS). No doc =
  contributor (['create']); creators always manage their own tasks; assignees always update status. Owner sets them in
  Settings (PermissionsPicker when adding, PermissionsDialog per member); `useMyPerms` drives the project page.
  Status updates: the status pill in each task row is a button for the ASSIGNEE only, opening `StatusDialog` (status,
  optional message ≤300, who to notify). The owner changes status from the edit form (Status field, assignee told
  automatically, no message). The edit form only opens for owner/creator. A non-owner
  MUST notify the owner (task stores `statusNoteId`, rules check it with existsAfter). `task_done` notes are replaced
  by `task_status`. Notes have `status`/`message` keys, log entries a `message` key: deploy rules and hosting together
  (`npm run deploy:all`), older app builds can't write the new shape.
- Project chat (added on 2026-10-21): `projects/{id}/messages` = { text ≤1000, authorId, authorName (= members[uid].displayName),
  createdAt } (no edits; author or owner deletes) and `projects/{id}/chatReads/{uid}` = { readAt } (every member reads all,
  each writes their own; drives the unread badge and ✓/✓✓ "seen"). `services/chat.js`, `useChat` (owned by the project page),
  `components/chat/{ProjectChat,MessageList}`: floating `ChatLauncher`, sticky column on xl+, `<dialog>` sheet below.
  Task rows lay out by the list's width (container query at 56rem), not the screen. `deleteProject` also clears both.
  New rules take about a minute to reach every server after a deploy (early writes can be denied).
- Kanban board (added on 2026-10-22): List/Board switch on the project page (`tf-task-view` in localStorage), board lazy-loaded
  (`components/board/{TaskBoard,BoardCard}`, @dnd-kit core+sortable). Tasks may have `rank` (fractional-indexing key, base 62, ≤64,
  compared as plain strings, `lib/rank.js`): changed by owner / assignee / `status` holder, same as status. A drop is `updateTask`
  with `{ status, rank }` (status change = log + owner note as usual), with Undo in the toast (`showToast` returns an id,
  `dismissToast`). New tasks get the bottom rank of To Do; the owner's board ranks old unranked tasks once (`setRanks`).
  Left/Right arrows jump columns by screen position (works in RTL); every card has a "Move to" menu (WCAG 2.5.7).
- Landing page (added on 2026-10-22, from the Claude Design canvas "TaskFlow landing page"): `pages/Landing.jsx` +
  `components/landing/` (copy.js = EN/AR text, sections, `landing.css`). The CSS is the one deliberate plain-CSS exception
  (scroll-driven reveals, looping demos): every rule is scoped under `.lp`, keyframes are `lp-*`, and it reads only the
  semantic tokens. Every sign-in button links to /login; the auth pages' logo links back to /. The page pitches to
  users, not reviewers: no security / RTL-engineering sections (Mohammed's call). Sections: hero, numbers, features,
  how it works, tour, who it's for (`Teams`), why (`Why`, without vs with), FAQ, CTA. Feature and role cards show one
  at a time in `Rotator` (JS timer, pauses on hover/focus, pause button, starts stopped under reduced motion).
  Hero has one floating card only (the notification); the Arabic headline has its own mask/underline offsets.
- Promo video + README (added on 2026-10-22): `video/` is a separate Remotion project (own package.json, ignored by the
  app's ESLint): 30 s, 1080p, `TaskFlowAr` / `TaskFlowEn`, screenshots via `npm run capture` (Edge + Playwright, Mohammed
  signs in with email/password; Google blocks automated browsers). README is written (English, no demo accounts): media
  in `docs/media/demo.gif` and `docs/screenshots/`; the inline video players are uploaded by Mohammed in the GitHub editor
  (`video/out/github/*.mp4`, under 10 MB) at the HTML comments in "Watch the 30-second tour".
- Next: phase 10 (delivery). Order: (1) demo script + code-review Q&A prep (explain the Overdue filter:
  `dueDate < today && status !== 'done'`, today = `todayISO()` in Asia/Hebron), (2) 5-8 screenshots in
  `docs/screenshots/` taken by Mohammed in his own browser from the live URL, (3) README LAST (Mohammed's choice):
  overview, features, stack, local setup, env vars, Firestore structure, rules (link `docs/SECURITY.md`), known
  limits, live URL, demo accounts (public: decide simple passwords), how to run tests, screenshots.
  Optional phase 11 (bonus) only after that: sort tasks, progress chart, route code-splitting (bundle is 339KB gzip).
- Mohammed makes all commits himself: prepare the changes and give him the `git add` / `git commit` commands.
