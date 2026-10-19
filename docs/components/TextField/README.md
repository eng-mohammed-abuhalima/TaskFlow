# TextField

Labelled text input or textarea with hint, inline error and optional character count.

## When to use

- Every form field: names, emails, titles, descriptions.
- Errors appear directly under the field, after the user leaves it or submits, never as a toast.

## Props

`label` (required) · `hint` · `error` · `required` · `multiline` + `rows` · `count` ("12/120") · every native input prop.

## Usage

```jsx
<TextField label="Project name" required hint="3–80 characters"
  value={name} onChange={(e) => setName(e.target.value)}
  error={nameError} />

<TextField label="Email" type="email" dir="ltr" autoComplete="email" error="Enter a valid email address, like name@team.dev" />
<TextField label="Description" multiline rows={3} />
```

## Classes

Exactly as in `components/src/components/Field.jsx` (semantic tokens and logical properties only):

```js
export const fieldClasses = {
  wrapper: 'flex min-w-0 flex-col gap-1.5',
  label: 'text-label font-medium text-fg',
  required: 'ms-0.5 text-danger-fg',
  // The shared box of every field (no height, so the textarea can size itself).
  box:
    'block w-full min-w-0 rounded-control border border-strong bg-field px-3 font-sans text-body text-fg ' +
    'placeholder:text-fg-subtle transition-[border-color,background-color] duration-fast ease-flow ' +
    'hover:border-fg-muted focus-ring motion-reduce:transition-none ' +
    'aria-invalid:border-danger disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-fg-subtle',
  // One-line controls: 44px on touch, 40px from md.
  height: 'h-touch md:h-control',
  // Typing fields mark focus with a primary border too; pickers (Select, DateField) don't, so
  // opening and closing a menu without choosing leaves the field unchanged.
  typing: 'focus:border-primary',
  // Grows with its content (field-sizing), no resize handle, no visible scrollbar.
  textarea:
    'min-h-24 max-h-60 resize-none py-2 field-sizing-content ' +
    '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
  hint: 'text-body-sm text-fg-subtle',
  error: 'flex items-start gap-1.5 text-body-sm font-medium text-danger-fg',
  count: 'ms-auto text-caption tabular-nums text-fg-subtle',
};
```

## Accessibility

- Textareas grow with their content up to 240px (`field-sizing-content`), then scroll; no resize handle and no visible scrollbar.
- The `<label>` is a real label (`htmlFor`). Errors and hints are linked with `aria-describedby`; invalid sets `aria-invalid`, which turns the border `border-danger`.
- Errors pair an icon with text, so they never depend on red alone.
- Fills use `bg-field`: white in light, a recessed well in dark.

## RTL

Text aligns to the start automatically. Emails, URLs and passwords take `dir="ltr"` even in Arabic.

## Don't

- Placeholder as the only label.
- Errors that say "Invalid" without telling the user how to fix it.
