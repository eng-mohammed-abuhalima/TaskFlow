# MembersManager

Project Settings panel: add an existing user by email, list members, remove them. Owner is marked and cannot be removed.

## When to use

- Project Settings (owner only).

## Props

`owner` · `members` · `email` · `error` · `adding` · `onEmail` · `onAdd` · `onRemove` · `lang`.

## Usage

```jsx
<MembersManager owner={ownerName} members={memberNames} email={email} onEmail={setEmail}
  error={error /* "No account uses this email" | "Rana Saleh is already a member" */}
  adding={adding} onAdd={add} onRemove={askToRemove} />
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

- Errors are inline under the email field (not toasts). Removing a member should go through a ConfirmDialog.

## RTL

The email field is `dir="ltr"`.

## Don't

- Letting the owner remove themselves (out of scope per the SRS).
