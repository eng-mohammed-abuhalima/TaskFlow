# FilterBar

Search + status/priority/assignee filters + live result count + Clear, in one panel.

## When to use

- Above the task list in Project Details.

## Props

`query/onQuery` · `status/onStatus` · `priority/onPriority` · `assignee/onAssignee` · `members` · `count` · `total` · `onClear` · `lang`.

## Usage

```jsx
<FilterBar query={q} onQuery={setQ} status={status} onStatus={setStatus}
  priority={priority} onPriority={setPriority} assignee={assignee} onAssignee={setAssignee}
  members={memberNames} count={filtered.length} total={tasks.length} onClear={reset} />
```

## Classes

Exactly as in `components/src/components/FilterBar.jsx` (semantic tokens and logical properties only):

```js
export const filterBarClasses = {
  root: 'flex flex-col gap-3 rounded-leaf border border-subtle bg-surface p-3 shadow-card lg:flex-row lg:items-end',
  selects: 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex lg:flex-none',
  select: 'lg:w-40',
  footer: 'flex items-center justify-between gap-3 lg:ms-auto lg:justify-end',
  count: 'text-body-sm tabular-nums text-fg-muted',
};
```

## Accessibility

- `role="search"`; the count is `aria-live="polite"` so screen readers hear "2 of 6 tasks".
- Clear is disabled when nothing is filtered.

## RTL

Stacks on phones (search, then a 2-column grid of selects), one row from `lg:`.

## Don't

- Hiding filters behind a drawer on desktop.
