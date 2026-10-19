# DateField

Date input: a field-styled button that opens a themed calendar (react-day-picker in a Radix Popover) with Today and Clear.

## When to use

- Task due dates.
- `Calendar` alone renders the grid inline (e.g. a planning sidebar).

## Props

`label` · `value` / `defaultValue` (ISO `YYYY-MM-DD` or null) · `onChange(isoOrNull)` · `lang` · `placeholder` · `hint` · `error` · `required` · `today` (for tests).

## Usage

```jsx
<DateField label="Due date" value={due} onChange={setDue} lang={lang} />

// Overdue logic stays string-based: isOverdue(due, status)
```

## Classes

Install: `npm i @radix-ui/react-popover react-day-picker date-fns`. The calendar is styled entirely through `classNames` (below), no react-day-picker stylesheet needed.

Exactly as in `components/src/components/Field.jsx` (semantic tokens and logical properties only):

```js
export const dateClasses = {
  trigger: 'flex items-center justify-between gap-2 overflow-hidden whitespace-nowrap pe-3 text-start cursor-pointer data-[state=open]:border-primary',
  changed: 'data-[changed=true]:border-primary',
  // Opened with the mouse/touch: when focus returns on close, don't draw the keyboard ring.
  quiet: 'data-[quiet=true]:focus-visible:outline-none',
  placeholder: 'text-fg-subtle',
  content:
    'z-50 rounded-leaf border border-subtle bg-surface-raised p-3 text-fg shadow-pop ' +
    'origin-(--radix-popover-content-transform-origin) data-[state=open]:animate-pop-in motion-reduce:animate-none',
  calendar: {
    root: 'relative',
    months: 'flex flex-col',
    month: 'flex flex-col gap-2',
    month_caption: 'flex h-9 items-center ps-1',
    caption_label: 'font-display text-subheading font-semibold text-fg',
    nav: 'absolute end-0 top-0 flex items-center gap-1',
    button_previous: 'inline-flex size-9 items-center justify-center rounded-leaf-sm text-fg-muted hover:bg-surface-hover hover:text-fg focus-ring disabled:opacity-40',
    button_next: 'inline-flex size-9 items-center justify-center rounded-leaf-sm text-fg-muted hover:bg-surface-hover hover:text-fg focus-ring disabled:opacity-40',
    chevron: 'size-4 fill-current',
    month_grid: 'border-collapse',
    weekdays: '',
    weekday: 'h-8 w-10 text-caption font-medium text-fg-subtle',
    week: '',
    day: 'p-0.5 text-center',
    day_button:
      'inline-flex size-9 items-center justify-center rounded-leaf-sm text-body tabular-nums text-fg ' +
      'transition-colors duration-fast hover:bg-surface-hover focus-ring',
    today: '[&>button]:font-semibold [&>button]:text-fg-primary [&>button]:ring-1 [&>button]:ring-primary/50',
    selected: '[&>button]:bg-primary [&>button]:text-on-primary [&>button]:hover:bg-primary-hover [&>button]:ring-0',
    outside: '[&>button]:text-fg-subtle/70',
    disabled: '[&>button]:opacity-40 [&>button]:pointer-events-none',
    hidden: 'invisible',
  },
  footer: 'mt-2 flex items-center justify-between gap-2 border-t border-subtle pt-2',
};
```

## Accessibility

- The trigger is a labelled button showing the full date; the popover traps focus and returns it on close. The grid is keyboard-navigable (arrows, PageUp/PageDown).
- Today is outlined, the selected day filled `bg-primary`, outside days dimmed.

## RTL

Arabic: Arabic month and day names, Saturday-first weeks, Western digits (`numerals="latn"`), navigation arrows mirrored (previous points right).

## Don't

- Native `<input type="date">`: its popup can't be themed or translated consistently across browsers.
