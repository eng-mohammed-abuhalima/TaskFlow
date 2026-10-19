# StatCard

One number with a label, tinted icon and optional hint, for the dashboard summary row.

## When to use

- Dashboard: Projects, Total tasks, Done, Overdue (2 columns on phones, 4 from `lg:`).

## Props

`label` · `value` · `icon` · `tone neutral|todo|progress|done|danger` · `hint` · `lang`.

## Usage

```jsx
<StatCard label="Overdue" value={overdue} icon={TriangleAlert} tone="danger" hint="Due before today" />
```

## Classes

Exactly as in `components/src/components/Cards.jsx` (semantic tokens and logical properties only):

```js
export const statCardClasses = variants({
  base: 'flex min-w-0 flex-col gap-3 rounded-leaf border border-subtle bg-surface p-card shadow-card',
  variants: { tone: { neutral: '', todo: '', progress: '', done: '', danger: '' } },
});
export const statIconClasses = variants({
  base: 'inline-flex size-9 items-center justify-center rounded-leaf-sm',
  variants: {
    tone: {
      neutral: 'bg-primary-soft text-fg-primary',
      todo: 'bg-status-todo-soft text-status-todo-fg',
      progress: 'bg-status-progress-soft text-status-progress-fg',
      done: 'bg-status-done-soft text-status-done-fg',
      danger: 'bg-danger-soft text-danger-fg',
    },
  },
  defaults: { tone: 'neutral' },
});
```

## Accessibility

- Numbers use `text-stat` + `tabular-nums` (IBM Plex figures are tabular), formatted with Western digits in both languages.

## RTL

Layout mirrors via flex; nothing to flip.

## Don't

- Vanity metrics or fake deltas.
