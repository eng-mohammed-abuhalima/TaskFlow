# DueDate

Due date with calendar icon; turns into a danger chip with a warning icon and the word "Overdue" when the date has passed and the task is not done.

## When to use

- Task rows, overdue list.

## Props

`due` (YYYY-MM-DD | null) · `status` · `lang` · `today` (for tests).

## Usage

```jsx
<DueDate due={task.due} status={task.status} lang={lang} />
// Overdue = due < today (app timezone) && status !== 'done'  → isOverdue(due, status)
```

## Classes

Exactly as in `components/src/components/Badges.jsx` (semantic tokens and logical properties only):

```js
export const dueClasses = variants({
  base: 'inline-flex items-center gap-1.5 whitespace-nowrap text-body-sm tabular-nums',
  variants: {
    tone: {
      normal: 'text-fg-muted',
      overdue: 'h-6 rounded-tight bg-danger-soft px-2 font-medium text-danger-fg',
      done: 'text-fg-subtle',
    },
  },
  defaults: { tone: 'normal' },
});
```

## Accessibility

- Dates render in `<time dateTime>`; the word "Overdue/متأخرة" carries the meaning, not the red.

## RTL

Dates use `Intl.DateTimeFormat("ar-u-nu-latn")` in Arabic: Arabic month names, Western digits (19 أكتوبر).

## Don't

- Mixing date formats between screens.
