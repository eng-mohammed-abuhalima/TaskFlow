# SearchField

Search input with a leading magnifier and a clear button that appears once there is text.

## When to use

- Client-side title search in the FilterBar.

## Props

`label` (accessible name, hidden by default) · `value` · `onChange` · `onClear` · `clearLabel` · `placeholder`.

## Usage

```jsx
<SearchField label="Search tasks by title" placeholder="Search tasks…"
  value={query} onChange={(e) => setQuery(e.target.value)} onClear={() => setQuery('')} />
```

## Classes

Exactly as in `components/src/components/Field.jsx` (semantic tokens and logical properties only):

```js
export const searchClasses = {
  icon: 'pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-fg-subtle',
  input: 'ps-9 pe-10 [&::-webkit-search-cancel-button]:appearance-none',
  clear:
    'absolute end-1 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-tight text-fg-subtle ' +
    'hover:bg-surface-hover hover:text-fg focus-ring touch-target',
};
```

## Accessibility

- Uses `type="search"` and a visually hidden `<label>`. The clear button has its own label and a 44px hit area.

## RTL

Icon at `start-3`, clear at `end-1`, padding `ps-9 pe-10`: all logical. The magnifier is not mirrored.

## Don't

- Search that fires a network request per keystroke (the SRS filters client-side).
