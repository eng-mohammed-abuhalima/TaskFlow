# PasswordField

Password input with show/hide toggle and an optional 3-step strength meter (Weak / Fair / Strong).

## When to use

- Sign in (no meter) and Create account (`showStrength`).

## Props

`label` · `value` / `defaultValue` · `onChange(value)` · `showStrength` · `autoComplete` (`current-password` / `new-password`) · `hint` · `error` · `required` · `disabled` · `lang`. `passwordStrength(pw)` returns 0–3.

## Usage

```jsx
<PasswordField label="Password" required lang={lang} showStrength autoComplete="new-password"
  value={pw} onChange={setPw} hint="At least 8 characters. Mix letters, numbers and symbols." />
```

## Classes

Exactly as in `components/src/components/Field.jsx` (semantic tokens and logical properties only):

```js
export const passwordClasses = {
  toggle:
    'absolute end-1 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-tight text-fg-subtle ' +
    'hover:bg-surface-hover hover:text-fg focus-ring touch-target',
  meter: 'flex items-center gap-2',
  bars: 'grid flex-1 grid-cols-3 gap-1',
  bar: 'h-1 rounded-pill transition-colors duration-base',
  barOff: 'bg-surface-sunken',
  barOn: { 1: 'bg-danger', 2: 'bg-warning', 3: 'bg-success' },
  label: { 1: 'text-danger-fg', 2: 'text-warning-fg', 3: 'text-success-fg' },
};
```

## Accessibility

- The toggle is a real button with `aria-pressed` and a label that says what it will do. The meter is `aria-live="polite"` and always shows the word, so strength never depends on colour.
- Strength: under 8 characters = weak; 2+ character kinds = fair; 12+ characters and 3+ kinds = strong. Firebase still enforces its own minimum.

## RTL

The field is always `dir="ltr"` (passwords are Latin input); the eye button sits at its end. The meter label follows the page direction.

## Don't

- Blocking paste into the field.
- A meter on the sign-in form.
