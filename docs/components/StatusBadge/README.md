# StatusBadge

Task status as a pill: icon + label + tinted fill. To Do, In Progress, Done.

## When to use

- Task rows, overdue lists, anywhere a status is shown.

## Props

`status` `todo|in_progress|done` · `lang`.

## Usage

```jsx
<StatusBadge status={task.status} lang={lang} />
```

## Classes

Exactly as in `components/src/components/Badges.jsx` (semantic tokens and logical properties only):

```js
// Shape: pill. Meaning carried by icon + text, colour is the third cue.
export const statusClasses = variants({
  base: 'inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-pill ps-1.5 pe-2.5 text-caption font-medium',
  variants: {
    status: {
      todo: 'bg-status-todo-soft text-status-todo-fg',
      in_progress: 'bg-status-progress-soft text-status-progress-fg',
      done: 'bg-status-done-soft text-status-done-fg',
    },
  },
  defaults: { status: 'todo' },
});
export const statusIcon = {
  todo: { icon: Circle, className: 'text-status-todo' },
  in_progress: { icon: CircleDashed, className: 'text-status-progress' },
  done: { icon: CircleCheck, className: 'text-status-done' },
};
```

## Accessibility

- Three cues: shape of the icon (empty circle, dashed circle, check circle), the word, and colour. Colour is never the only signal.
- Text on the soft fills is ≥ 6:1 in both themes (see Colour & contrast).

## RTL

Icons are not mirrored. Labels: لم تبدأ / قيد التنفيذ / مكتملة.

## Don't

- Status as a coloured dot alone.
- Inventing new statuses: the data model allows exactly three.
