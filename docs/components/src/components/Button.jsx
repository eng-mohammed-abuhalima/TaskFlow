import { LoaderCircle } from 'lucide-react';
import { variants } from '../lib/cx.js';
import { Icon } from '../lib/icons.jsx';

// #region classes
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
// #endregion

export function Button({ variant, size, iconOnly, loading = false, icon, iconEnd, mirrorIcon, disabled, className, children, type = 'button', ...rest }) {
  const iconSize = size === 'sm' ? 14 : 16;
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, iconOnly, className })}
      {...rest}
    >
      {loading ? (
        <Icon icon={LoaderCircle} size={iconSize} className="animate-spin motion-reduce:animate-none" />
      ) : (
        icon && <Icon icon={icon} size={iconSize} mirror={mirrorIcon} />
      )}
      {children}
      {iconEnd && !loading && <Icon icon={iconEnd} size={iconSize} mirror={mirrorIcon} />}
    </button>
  );
}
