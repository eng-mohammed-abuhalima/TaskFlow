# Button

The one clickable action: primary, secondary, ghost or danger, in three sizes, with loading and disabled states.

## When to use

- `primary`: the single main action of a view (New task, Sign in, Create task). One per area.
- `secondary`: the alternative (Cancel, Settings). `ghost`: low-emphasis and icon actions in rows and toolbars.
- `danger`: destructive and irreversible only (Delete project). Always behind a ConfirmDialog.

## Props

variant `primary|secondary|ghost|danger` · size `sm|md|lg` · `icon`, `iconEnd` (lucide component) · `mirrorIcon` · `iconOnly` (needs `aria-label`) · `loading` · plus every native button prop.

## Usage

```jsx
import { Plus, ArrowRight, Trash2 } from 'lucide-react';

<Button icon={Plus}>New task</Button>
<Button variant="secondary">Cancel</Button>
<Button iconEnd={ArrowRight} mirrorIcon>Continue</Button>   {/* arrow flips in RTL */}
<Button variant="danger" icon={Trash2} loading={saving}>Delete project</Button>
<Button variant="ghost" size="sm" iconOnly icon={Pencil} aria-label={`Edit ${task.title}`} />
```

## Classes

Press: `active:translate-y-px` plus the 2px bottom lip (`inset-shadow-lip`) disappears, so the button visibly sinks. Both are dropped under `motion-reduce`.

Exactly as in `components/src/components/Button.jsx` (semantic tokens and logical properties only):

```js
export const buttonClasses = variants({
  base:
    'relative inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap ' +
    'rounded-leaf-sm font-sans text-label font-medium ' +
    'transition-[background-color,border-color,color,box-shadow,translate] duration-fast ease-flow ' +
    'focus-ring active:translate-y-px motion-reduce:transition-none motion-reduce:active:translate-y-0 ' +
    'disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress',
  variants: {
    variant: {
      primary: 'bg-primary text-on-primary shadow-card inset-shadow-lip hover:bg-primary-hover active:inset-shadow-none',
      secondary: 'border border-strong bg-surface text-fg shadow-card hover:bg-surface-hover active:bg-surface-sunken active:shadow-none',
      ghost: 'text-fg-muted hover:bg-surface-hover hover:text-fg active:bg-surface-sunken',
      danger: 'bg-danger text-on-danger shadow-card inset-shadow-lip hover:bg-danger-hover active:inset-shadow-none',
    },
    size: {
      sm: 'h-control-sm px-3 touch-target',
      md: 'h-touch px-4 md:h-control',
      lg: 'h-control-lg px-5 text-body',
    },
    iconOnly: { true: 'aspect-square px-0' },
  },
  defaults: { variant: 'primary', size: 'md' },
});
```

## Accessibility

- Focus: `focus-ring`: a 2px saffron outline on the button's own edge (offset -1px), so it replaces the border rather than floating outside it. Keyboard only.
- `md` is 44px tall below `md:` (touch) and 40px from `md:` up. `sm` is 32px but `touch-target` grows its hit area to 44px.
- `loading` keeps the label, adds a spinner, sets `aria-busy` and disables the button so it cannot double-submit.

## RTL

Use `mirrorIcon` for arrows/chevrons only. Never for plus, check, trash or the logo. The leaf corner mirrors on its own (logical radii).

## Don't

- Two primary buttons side by side.
- A danger button without confirmation.
- Icon-only button without `aria-label`.
- Overriding colours with raw classes (`bg-teal-700`): they do not exist in this theme.
