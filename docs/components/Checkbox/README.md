# Checkbox

Native checkbox with a drawn check, inside a label row that is at least 44px tall on touch.

## When to use

- Independent on/off choices: "Hide completed", "Show only my tasks".

## Props

`label` · every native input prop (`checked`, `defaultChecked`, `disabled`, `onChange`).

## Usage

```jsx
<Checkbox label="Hide completed" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} />
```

## Classes

Exactly as in `components/src/components/Field.jsx` (semantic tokens and logical properties only):

```js
export const checkboxClasses = {
  row: 'group inline-flex min-h-touch cursor-pointer items-center gap-2.5 text-body text-fg md:min-h-control-sm has-disabled:cursor-not-allowed has-disabled:opacity-50',
  box:
    'peer size-[1.125rem] shrink-0 appearance-none rounded-tight border border-strong bg-field ' +
    'transition-[background-color,border-color] duration-fast ease-flow focus-ring ' +
    'checked:border-primary checked:bg-primary hover:border-fg-muted checked:hover:bg-primary-hover motion-reduce:transition-none',
  mark: 'pointer-events-none absolute text-on-primary opacity-0 peer-checked:opacity-100',
};
```

## Accessibility

- It is a real `<input type="checkbox">`, so Space toggles it and screen readers announce it. The whole row is clickable.

## RTL

The checkmark is never mirrored.

## Don't

- Checkboxes to change task status: status has three values, use a Select.
