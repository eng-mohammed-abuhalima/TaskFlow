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

1. `/` — redirect: signed in → /dashboard, else → /login
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
- Member: read project + tasks; create tasks (createdBy = self); edit tasks they created or are assigned to;
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
- Next: projects CRUD → tasks CRUD → firestore.rules + tests with a second account → deploy.
- Mohammed makes all commits himself: prepare the changes and give him the `git add` / `git commit` commands.
