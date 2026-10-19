# Avatar

Initials avatar, avatar stack and member chip (with owner crown and remove button).

## When to use

- Assignees, member lists, navbar user.

## Props

Avatar: `name` · `size sm|md|lg` · `label` (only when no visible name). AvatarStack: `names` · `max` · `label`. MemberChip: `name` · `owner` · `onRemove` · `removeLabel`.

## Usage

```jsx
<Avatar name="Sara Haddad" />
<AvatarStack names={project.members} max={4} label="5 members" />
<MemberChip name="Sara Haddad" owner ownerLabel="Owner" />
<MemberChip name="Omar Nasser" onRemove={() => remove(uid)} removeLabel="Remove Omar Nasser" />
```

## Classes

Exactly as in `components/src/components/Avatar.jsx` (semantic tokens and logical properties only):

```js
export const avatarClasses = variants({
  base: 'inline-flex shrink-0 select-none items-center justify-center rounded-pill font-sans font-semibold leading-none',
  variants: {
    size: { xs: 'size-5 text-[0.5625rem]', sm: 'size-7 text-[0.6875rem]', md: 'size-8 text-caption', lg: 'size-10 text-label' },
    tone: {
      pine: 'bg-primary-soft text-fg-primary',
      saffron: 'bg-accent-soft text-fg-accent',
      ink: 'bg-status-todo-soft text-status-todo-fg',
    },
  },
  defaults: { size: 'md', tone: 'pine' },
});
// Only stacked avatars get a ring (to cut them apart); single avatars sit flat so they never cover a border.
export const avatarStackRing = 'ring-2 ring-surface';
export const memberChipClasses =
  'inline-flex h-8 max-w-full items-center gap-2 rounded-pill border border-subtle bg-surface ps-1 pe-3 text-body-sm text-fg';
```

## Accessibility

- Tone is picked from the name (pine, saffron or ink), never meaning. Avatars beside a visible name are `aria-hidden`.
- Only stacked avatars get the 2px `ring-surface` cut-out; single avatars (chips, rows) sit flat so they never cover a border.
- Remove buttons name the person and have a 44px hit area.

## RTL

Arabic names show one letter (س), Latin names two (SH). Stacks overlap with `-ms-1`, so they stack toward the end in both directions.

## Don't

- Colour-coding people by role.
