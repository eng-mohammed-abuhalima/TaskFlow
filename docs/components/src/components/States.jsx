import { ArrowLeft, ShieldX, FileQuestion } from 'lucide-react';
import { cx } from '../lib/cx.js';
import { Icon } from '../lib/icons.jsx';
import { Button } from './Button.jsx';

// #region empty
export const emptyClasses = {
  root: 'flex flex-col items-center gap-3 rounded-leaf border border-dashed border-strong/60 bg-surface px-6 py-10 text-center',
  tile: 'mb-1 inline-flex size-12 items-center justify-center rounded-leaf bg-primary-soft text-fg-primary',
  title: 'font-display text-subheading font-semibold text-fg',
  body: 'max-w-sm text-body-sm text-fg-muted',
};
// #endregion

export function EmptyState({ icon, title, children, action, className }) {
  return (
    <div className={cx(emptyClasses.root, className)}>
      {icon && <span className={emptyClasses.tile}><Icon icon={icon} size={24} /></span>}
      <h3 className={emptyClasses.title}>{title}</h3>
      {children && <p className={emptyClasses.body}>{children}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

// #region skeleton
export const skeletonClasses = 'block rounded-tight bg-surface-sunken animate-shimmer motion-reduce:animate-none';
// #endregion
export const Skeleton = ({ className }) => <span aria-hidden="true" className={cx(skeletonClasses, className)} />;

export function SkeletonProjectCard() {
  return (
    <div className="flex flex-col gap-4 rounded-leaf border border-subtle bg-surface p-card" aria-hidden="true">
      <Skeleton className="h-5 w-2/3" />
      <div className="flex flex-col gap-2"><Skeleton className="h-3.5 w-full" /><Skeleton className="h-3.5 w-4/5" /></div>
      <Skeleton className="h-1.5 w-full rounded-pill" />
      <div className="flex items-center justify-between"><Skeleton className="h-6 w-20 rounded-pill" /><Skeleton className="h-3.5 w-16" /></div>
    </div>
  );
}
export function SkeletonTaskRow() {
  return (
    <li className="flex items-center gap-4 px-4 py-3.5" aria-hidden="true">
      <div className="flex flex-1 flex-col gap-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-1/3" /></div>
      <Skeleton className="h-6 w-24 rounded-pill max-md:hidden" />
      <Skeleton className="h-6 w-16" />
    </li>
  );
}
export function Loading({ label = 'Loading…', children, className }) {
  return (
    <div aria-busy="true" className={className}>
      <span className="sr-only" role="status">{label}</span>
      {children}
    </div>
  );
}

// #region state
export const statePageClasses = {
  root: 'mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-16 text-center',
  code: 'font-display text-display font-semibold tabular-nums text-fg-subtle',
  tile: 'inline-flex size-14 items-center justify-center rounded-leaf',
  title: 'font-display text-title font-semibold text-fg',
  body: 'text-body text-fg-muted',
};
// #endregion

const KINDS = {
  denied: { code: '403', icon: ShieldX, tile: 'bg-danger-soft text-danger-fg' },
  notFound: { code: '404', icon: FileQuestion, tile: 'bg-accent-soft text-fg-accent' },
};
export function StatePage({ kind = 'notFound', title, children, actionLabel, onAction, href }) {
  const k = KINDS[kind];
  return (
    <section className={statePageClasses.root} aria-labelledby={'state-' + kind}>
      <span className={cx(statePageClasses.tile, k.tile)}><Icon icon={k.icon} size={28} /></span>
      <p className={statePageClasses.code} aria-hidden="true">{k.code}</p>
      <h1 id={'state-' + kind} className={statePageClasses.title}>{title}</h1>
      <p className={statePageClasses.body}>{children}</p>
      <Button variant="secondary" icon={ArrowLeft} mirrorIcon onClick={onAction}>{actionLabel}</Button>
    </section>
  );
}
