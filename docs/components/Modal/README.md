# Modal

Dialog on the raised surface with title, close button, body and an action footer. Built on native `<dialog>` + `showModal()`.

## When to use

- Create/edit task. Short, focused forms only.

## Props

`open` · `onClose` · `title` · `footer` · `icon` · `closeLabel` · `children`.

## Usage

```jsx
const [open, setOpen] = useState(false);

<Modal open={open} onClose={() => setOpen(false)} title="New task">
  <TaskForm onCancel={() => setOpen(false)} onSubmit={save} />
</Modal>
```

## Classes

Entrance: `animate-modal-in` (200ms, ease-flow, 6px rise), disabled under `motion-reduce`.

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

- `showModal()` gives focus trapping, Esc to close, an inert background and `::backdrop` for free.
- Title is wired with `aria-labelledby`. Return focus to the trigger on close.

## RTL

Close button sits at the end of the header in both directions; footer actions align to the end.

## Don't

- Modals on top of modals.
- Closing on backdrop click while a form has unsaved input.
