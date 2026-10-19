# PriorityBadge

Task priority as a squared tag with 1–3 signal bars + label. Low, Medium, High.

## When to use

- Next to the status badge; the different shape (squared + bars vs pill + circle) keeps them apart at a glance.

## Props

`priority` `low|medium|high` · `lang`.

## Usage

```jsx
<PriorityBadge priority={task.priority} lang={lang} />
```

## Classes

Exactly as in `components/src/components/Badges.jsx` (semantic tokens and logical properties only):

```js
// Shape: squared tag + signal bars (1/2/3 filled). Never confused with the status pill.
export const priorityClasses = variants({
  base: 'inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-tight border px-2 text-caption font-medium',
  variants: {
    priority: {
      low: 'border-subtle bg-priority-low-soft text-priority-low-fg',
      medium: 'border-priority-medium/40 bg-priority-medium-soft text-priority-medium-fg',
      high: 'border-priority-high/40 bg-priority-high-soft text-priority-high-fg',
    },
  },
  defaults: { priority: 'medium' },
});
export const priorityBar = { low: 'text-priority-low', medium: 'text-priority-medium', high: 'text-priority-high' };
```

## Accessibility

- Bars filled = level (1/2/3) so priority reads without colour.

## RTL

Bars are a quantity, not a direction: never mirrored. Labels: منخفضة / متوسطة / عالية.

## Don't

- Red for anything but High.
