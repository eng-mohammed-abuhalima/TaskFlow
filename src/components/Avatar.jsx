import { X, Crown } from 'lucide-react';
import { cx, variants } from '../lib/cx.js';
import { Icon } from '../lib/icons.jsx';

// #region classes
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
// #endregion

const TONES = ['pine', 'saffron', 'ink'];
const toneFor = (name = '') => TONES[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % TONES.length];
// Latin: two initials. Arabic: first letter only (isolated letters do not join into a readable pair).
export const initials = (name = '') => {
  const parts = name.trim().split(/\s+/);
  if (/[\u0600-\u06FF]/.test(name)) return [...parts[0]][0] || '';
  return parts.slice(0, 2).map((p) => [...p][0]).join('').toUpperCase();
};

/** Decorative by default (name shown next to it). Pass `label` when it stands alone. */
export function Avatar({ name, size, label, className }) {
  return (
    <span
      className={avatarClasses({ size, tone: toneFor(name), className })}
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      title={label ? name : undefined}
    >
      {initials(name)}
    </span>
  );
}

export function AvatarStack({ names = [], max = 4, size = 'sm', label }) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return (
    <span className="inline-flex items-center [&>*+*]:-ms-1" role="img" aria-label={label || names.join(', ')}>
      {shown.map((n, i) => <Avatar key={i} name={n} size={size} className={avatarStackRing} />)}
      {extra > 0 && (
        <span className={avatarClasses({ size, tone: 'ink', className: 'tabular-nums ' + avatarStackRing })} aria-hidden="true">+{extra}</span>
      )}
    </span>
  );
}

export function MemberChip({ name, owner, ownerLabel = 'Owner', onRemove, removeLabel, className }) {
  return (
    <span className={cx(memberChipClasses, onRemove && 'pe-1', className)}>
      <Avatar name={name} size="sm" />
      <span className="user-text truncate">{name}</span>
      {owner && (
        <span className="inline-flex items-center gap-1 text-caption font-medium text-fg-accent">
          <Icon icon={Crown} size={14} />
          {ownerLabel}
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel || 'Remove ' + name}
          className="inline-flex size-6 items-center justify-center rounded-pill text-fg-subtle hover:bg-danger-soft hover:text-danger-fg focus-ring touch-target"
        >
          <Icon icon={X} size={14} />
        </button>
      )}
    </span>
  );
}
