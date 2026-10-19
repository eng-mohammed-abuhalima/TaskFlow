# TaskForm

Create/edit form for a task: title, description, status, priority, due date, assignee.

## When to use

- Inside a Modal from Project Details ("New task", "Edit task").

## Props

`values` · `errors` ({title, due}) · `members` · `saving` · `onCancel` · `onSubmit` · `title` (submit label) · `lang`.

## Usage

```jsx
<Modal open={open} onClose={close} title="New task">
  <TaskForm members={memberNames} values={draft} errors={errors} saving={saving}
    onCancel={close} onSubmit={save} />
</Modal>
```

## Classes

Composed from TextField, Select and Button; it has no classes of its own besides layout (`flex flex-col gap-4`, `grid gap-4 sm:grid-cols-2`).

## Accessibility

- Title is required, 3–120 chars, with a live count. Submit is disabled (and shows "Saving…") while saving.
- Status defaults to To Do; assignee options are project members only.

## RTL

Two-column grid from `sm:`; one column on phones. Actions stack (primary on top) on phones.

## Don't

- Validating only on submit with a generic toast.
