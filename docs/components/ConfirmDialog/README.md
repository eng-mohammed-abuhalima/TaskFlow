# ConfirmDialog

Modal variant for destructive confirmations: warning tile, a question as title, consequences in the body, Cancel (autofocused) + danger action.

## When to use

- Delete project, delete task, remove member.

## Props

`title` · `children` (consequence) · `confirmLabel` · `cancelLabel` · `onConfirm` · `onCancel` · `loading` · `tone`.

## Usage

```jsx
<ConfirmDialog open={!!toDelete} title={`Delete “${p.name}”?`}
  confirmLabel="Delete project" cancelLabel="Cancel" loading={deleting}
  onConfirm={remove} onCancel={() => setToDelete(null)}>
  All {p.taskCount} tasks will be deleted for every member. This can’t be undone.
</ConfirmDialog>
```

## Classes

Uses `modalClasses` plus a `bg-danger-soft text-danger-fg` icon tile.

Exactly as in `components/src/components/Overlay.jsx` (semantic tokens and logical properties only):

```js
export const modalClasses = {
  dialog:
    'm-auto w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-leaf border border-subtle bg-surface-raised p-0 text-fg shadow-modal ' +
    'backdrop:bg-scrim open:animate-modal-in motion-reduce:open:animate-none',
  inline: 'relative w-full max-w-md overflow-hidden rounded-leaf border border-subtle bg-surface-raised text-fg shadow-modal',
  header: 'flex items-start gap-3 px-5 pt-5',
  title: 'flex-1 font-display text-heading font-semibold text-fg',
  body: 'px-5 pt-2 pb-5 text-body text-fg-muted',
  footer: 'flex flex-col-reverse gap-2 border-t border-subtle bg-surface px-5 py-4 sm:flex-row sm:justify-end',
};
```

## Accessibility

- Focus starts on Cancel, the safe choice. The confirm label repeats the verb ("Delete project"), never just "OK".

## RTL

Same as Modal.

## Don't

- Vague titles ("Are you sure?").
