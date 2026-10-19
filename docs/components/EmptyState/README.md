# EmptyState

Friendly empty placeholder: icon tile, title, one sentence and the next action.

## When to use

- No projects yet, no tasks yet, no results for these filters.

## Props

`icon` · `title` · `children` · `action`.

## Usage

```jsx
<EmptyState icon={ListTodo} title="No tasks yet"
  action={<Button icon={Plus} onClick={openNew}>Create the first task</Button>}>
  Tasks you and your team add to this project will show up here.
</EmptyState>
```

## Classes

Exactly as in `components/src/components/States.jsx` (semantic tokens and logical properties only):

```js
export const emptyClasses = {
  root: 'flex flex-col items-center gap-3 rounded-leaf border border-dashed border-strong/60 bg-surface px-6 py-10 text-center',
  tile: 'mb-1 inline-flex size-12 items-center justify-center rounded-leaf bg-primary-soft text-fg-primary',
  title: 'font-display text-subheading font-semibold text-fg',
  body: 'max-w-sm text-body-sm text-fg-muted',
};
```

## Accessibility

- The title says what is empty; the action says what to do. "No results" offers Clear filters.

## RTL

Centered; nothing to mirror.

## Don't

- Jokes or illustrations that delay the action.
