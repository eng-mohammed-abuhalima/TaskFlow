# Select

Dropdown built on Radix Select (headless), styled like TextField, with a themed popup whose options can carry an icon (status icon, priority bars, avatar).

## When to use

- Status, priority, assignee pickers; filters.
- Up to ~15 options. For longer lists (many members), switch to a searchable combobox.

## Props

`label` · `options: {value,label,icon?,disabled?}[]` (values are non-empty strings: use `"none"` for Unassigned) · `value` / `defaultValue` · `onChange(value)` · `placeholder` · `hint` · `error` · `required` · `disabled` · `name`.

## Usage

```jsx
import { Select } from './components/Field.jsx';
import { statusOptions, priorityOptions } from './components/Badges.jsx';

<Select label="Status" value={status} onChange={setStatus} options={statusOptions(lang)} />
<Select label="Priority" defaultValue="medium" options={priorityOptions(lang)} />
<Select label="Assignee" placeholder="Choose a member" value={assignee} onChange={setAssignee}
  options={[{ value: 'none', label: 'Unassigned' }, ...members.map((m) => ({ value: m.uid, label: m.name, icon: <Avatar name={m.name} size="xs" /> }))]} />
```

## Classes

Trigger: `fieldClasses.control` (shared with TextField) + the classes below. Install: `npm i @radix-ui/react-select @radix-ui/react-direction`.

Exactly as in `components/src/components/Field.jsx` (semantic tokens and logical properties only):

```js
export const selectClasses = {
  trigger:
    'flex items-center justify-between gap-2 overflow-hidden whitespace-nowrap pe-3 text-start cursor-pointer data-placeholder:text-fg-subtle ' +
    'data-[state=open]:border-primary [&>span]:min-w-0 [&>span]:truncate',
  changed: 'data-[changed=true]:border-primary',
  // Opened with the mouse/touch: when focus returns on close, don't draw the keyboard ring.
  quiet: 'data-[quiet=true]:focus-visible:outline-none',
  content:
    'z-50 max-h-(--radix-select-content-available-height) min-w-(--radix-select-trigger-width) overflow-hidden ' +
    'rounded-leaf border border-subtle bg-surface-raised p-1 text-fg shadow-pop ' +
    'origin-(--radix-select-content-transform-origin) data-[state=open]:animate-pop-in motion-reduce:animate-none',
  item:
    // First/last rows follow the menu's leaf corners (card radius minus the 5px of border + padding).
    'relative flex min-h-touch cursor-pointer select-none items-center gap-2.5 rounded-tight ps-2.5 pe-8 text-body text-fg outline-none ' +
    'first:rounded-ss-[calc(var(--radius-card)-5px)] last:rounded-ee-[calc(var(--radius-card)-5px)] ' +
    'md:min-h-control-sm data-highlighted:bg-surface-hover data-[state=checked]:font-medium data-[state=checked]:text-fg-primary ' +
    'data-disabled:pointer-events-none data-disabled:opacity-50',
  check: 'absolute end-2.5 inline-flex items-center text-fg-primary',
};
```

## Accessibility

- Radix provides `role="combobox"` + listbox semantics, typeahead, arrow keys, Home/End, Esc, and returns focus to the trigger. The `<label>` is wired to the trigger.
- The selected option shows a check at the end and `text-fg-primary`; the highlighted one `bg-surface-hover`. The first and last rows follow the menu's leaf corners. Rows are 44px on touch.
- Focus feedback: the keyboard ring appears only when the field is reached with the keyboard. Opening and closing it with the mouse or touch leaves the field as it was; picking a NEW value turns the border `primary` until focus leaves (`data-changed`).

## RTL

Pass the direction once with Radix `DirectionProvider` (app root) or `ThemeScope` (docs). The chevron is not mirrored; the check sits at the end.

## Don't

- Hiding meaning in colour only inside options (status and priority options keep their icons).
- An empty-string value (Radix reserves it for "no selection").
