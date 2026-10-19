# Skeleton

Loading placeholders shaped like the content they replace (project card, task row, stat).

## When to use

- First load of dashboard and task lists, shown for slow requests (NFR-01).

## Props

`Skeleton` `className` for size. Ready-made: `SkeletonProjectCard`, `SkeletonTaskRow`. Wrap in `Loading` for the accessible message.

## Usage

```jsx
<Loading label="Loading tasks…">
  <ul className="rounded-leaf border border-subtle bg-surface">
    <SkeletonTaskRow /><SkeletonTaskRow /><SkeletonTaskRow />
  </ul>
</Loading>
```

## Classes

Exactly as in `components/src/components/States.jsx` (semantic tokens and logical properties only):

```js
export const skeletonClasses = 'block rounded-tight bg-surface-sunken animate-shimmer motion-reduce:animate-none';
```

## Accessibility

- Placeholders are `aria-hidden`; `Loading` sets `aria-busy` and one `role="status"` message.
- The shimmer is a calm opacity pulse and stops under `motion-reduce`.

## RTL

Nothing to mirror.

## Don't

- Spinners for whole pages.
