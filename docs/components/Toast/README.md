# Toast

Transient feedback after an action: success, error (with Retry) or info. Bottom-end on desktop, bottom-full-width on phones.

## When to use

- "Task created", "Couldn’t save your changes" (with Retry). Field errors stay inline instead.

## Props

`tone success|error|info` · `title` · `message` · `action` · `onClose` · `closeLabel`.

## Usage

```jsx
<div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:end-4 sm:items-end">
  <Toast tone="error" title="Couldn’t save your changes" message="Check your connection and try again. Nothing was saved."
    action={<Button size="sm" variant="secondary" onClick={retry}>Retry</Button>} onClose={dismiss} />
</div>
```

## Classes

Exactly as in `components/src/components/Overlay.jsx` (semantic tokens and logical properties only):

```js
export const toastClasses = variants({
  base:
    'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-leaf border bg-surface-raised p-3 pe-2 shadow-pop ' +
    'motion-safe:animate-toast-in',
  variants: {
    tone: {
      success: 'border-subtle',
      error: 'border-danger/50',
      info: 'border-subtle',
    },
  },
  defaults: { tone: 'info' },
});
export const toastIcon = {
  success: { icon: CircleCheck, className: 'text-success' },
  error: { icon: CircleAlert, className: 'text-danger' },
  info: { icon: Info, className: 'text-info' },
};
export const toasterClasses = 'pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:end-4 sm:items-end';
```

## Accessibility

- Errors use `role="alert"`, others `role="status"`. Error toasts stay until dismissed; success may auto-dismiss after ~5s.

## RTL

The container uses `end-4`, so it moves to the bottom-left in Arabic.

## Don't

- Toasts for validation errors.
- Saying "Saved" before the write actually succeeds (TC-16: no false success).
