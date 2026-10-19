# DangerZone

The destructive section at the bottom of Project Settings, tinted danger, with an explanation and a Delete button.

## When to use

- Project Settings, owner only, always last on the page.

## Props

`projectName` · `onDelete` · `lang`.

## Usage

```jsx
<DangerZone projectName={project.name} onDelete={() => setConfirmOpen(true)} />
```

## Classes

Exactly as in `components/src/components/Settings.jsx` (semantic tokens and logical properties only):

```js
export const panelClasses = {
  root: 'rounded-leaf border border-subtle bg-surface shadow-card',
  header: 'flex flex-col gap-1 border-b border-subtle px-5 py-4',
  title: 'font-display text-heading font-semibold text-fg',
  desc: 'text-body-sm text-fg-muted',
  body: 'flex flex-col gap-4 p-5',
  danger: 'border-danger/50 bg-danger-soft/40',
  dangerHeader: 'border-danger/30',
};
```

## Accessibility

- The button only opens a ConfirmDialog; it never deletes directly. The heading says "Danger zone" in words, not just red.

## RTL

Stacks on phones; text start, button end from `sm:`.

## Don't

- Placing other settings inside the danger panel.
