# StatePage

Full-page access-denied (403) and not-found (404) states with a way back to the dashboard.

## When to use

- A non-member opens a project URL (denied). A project id that no longer exists (not found).

## Props

`kind denied|notFound` · `title` · `children` · `actionLabel` · `onAction`.

## Usage

```jsx
<StatePage kind="denied" title="You don’t have access" actionLabel="Back to dashboard" onAction={() => navigate('/dashboard')}>
  This project is private to its members. Ask the owner to add you.
</StatePage>
```

## Classes

Exactly as in `components/src/components/States.jsx` (semantic tokens and logical properties only):

```js
export const statePageClasses = {
  root: 'mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-16 text-center',
  code: 'font-display text-display font-semibold tabular-nums text-fg-subtle',
  tile: 'inline-flex size-14 items-center justify-center rounded-leaf',
  title: 'font-display text-title font-semibold text-fg',
  body: 'text-body text-fg-muted',
};
```

## Accessibility

- Uses an `<h1>`; the code (403/404) is decorative. Never reveal the project name to a non-member.

## RTL

The back arrow is mirrored in RTL.

## Don't

- Blank screens or crashes when a document is missing.
