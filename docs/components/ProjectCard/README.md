# ProjectCard

Clickable project summary: name, description, progress, members and overdue count, on the leaf-cornered card.

## When to use

- Dashboard project grid (1 column on phones, 2 from `md:`).

## Props

`name` · `description` · `href` · `done` · `total` · `overdue` · `members` · `updated` · `lang`.

## Usage

```jsx
<ProjectCard name={p.name} description={p.description} href={`/projects/${p.id}`}
  done={doneCount} total={taskCount} overdue={overdueCount}
  members={memberNames} updated={p.updatedAt} lang={lang} />
```

## Classes

Hover: lifts 2px and moves from `shadow-card` to `shadow-pop` in 160ms; no lift under `motion-reduce`.

Exactly as in `components/src/components/Cards.jsx` (semantic tokens and logical properties only):

```js
export const projectCardClasses = {
  root:
    'group relative flex min-w-0 flex-col gap-4 rounded-leaf border border-subtle bg-surface p-card shadow-card ' +
    'transition-[translate,box-shadow,border-color] duration-base ease-flow ' +
    'hover:-translate-y-0.5 hover:border-strong hover:shadow-pop has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-ring ' +
    'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
  title: 'font-display text-subheading font-semibold text-fg',
  link: 'outline-none after:absolute after:inset-0 after:rounded-[inherit] after:content-[""]',
  arrow: 'text-fg-subtle transition-[color,translate] duration-base ease-flow group-hover:text-fg-primary group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 motion-reduce:transition-none',
  description: 'line-clamp-2 text-body-sm text-fg-muted',
  track: 'h-1.5 w-full overflow-hidden rounded-pill bg-surface-sunken',
  fill: 'h-full rounded-pill bg-primary transition-[width] duration-slow ease-flow motion-reduce:transition-none',
  meta: 'flex items-center justify-between gap-3 text-body-sm text-fg-muted',
};
```

## Accessibility

- The whole card is one link (stretched `::after` on the title link), so it is one tab stop with a readable name. The focus ring is drawn around the card via `has-[a:focus-visible]`.
- Progress is a real `role="progressbar"` with the numbers also printed.

## RTL

The corner arrow is mirrored (↗ becomes ↖). The progress bar fills from the start side.

## Don't

- Buttons inside the card (nested interactive content).
