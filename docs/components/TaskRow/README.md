# TaskRow

One task in a list: title, description, assignee, priority, due date, status and edit/delete actions. A table-like grid from `md:`, a stacked card on phones.

## When to use

- Project Details task list (`TaskList` wraps rows in a bordered `<ul>`).

## Props

TaskRow: `task` · `canEdit` · `canDelete` · `onEdit` · `onDelete` · `lang`. TaskList: `tasks` · `label` · same row props.

## Usage

```jsx
<TaskList tasks={visibleTasks} lang={lang} label="Tasks"
  canEdit={canEdit} canDelete={canDelete} onEdit={openEdit} onDelete={confirmDelete} />
```

## Classes

Exactly as in `components/src/components/Task.jsx` (semantic tokens and logical properties only):

```js
export const taskListClasses = 'overflow-hidden rounded-leaf border border-subtle bg-surface shadow-card [&>li+li]:border-t [&>li+li]:border-subtle';
export const taskRowClasses = {
  root:
    'group grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2 px-4 py-3 transition-colors duration-fast ease-flow hover:bg-surface-hover ' +
    'md:grid-cols-[minmax(0,1fr)_8.5rem_6.5rem_8.5rem_7.5rem_auto] md:items-center md:gap-4 motion-reduce:transition-none',
  title: 'text-body font-medium text-fg',
  titleDone: 'text-fg-muted',
  desc: 'mt-0.5 line-clamp-1 text-body-sm text-fg-muted',
  meta: 'col-span-2 flex flex-wrap items-center gap-2 md:contents',
  assignee: 'inline-flex min-w-0 items-center gap-2 text-body-sm text-fg-muted',
  actions: 'col-start-2 row-start-1 flex items-center gap-0.5 md:col-start-auto md:row-start-auto',
};
```

## Accessibility

- Action buttons are always visible (no hover-only controls) and are labelled with the task title.
- Hide Edit/Delete when the user lacks permission, but rely on Firestore rules for enforcement.

## RTL

Grid columns flow with the reading direction; no manual reversing.

## Don't

- Strike-through on done tasks (hurts legibility). Done uses `text-fg-muted` plus the Done badge.
