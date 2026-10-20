import { Link } from 'react-router-dom';
import { ArrowUpRight, TriangleAlert } from 'lucide-react';
import { variants } from '../lib/cx.js';
import { Icon } from '../lib/icons.jsx';
import { AvatarStack } from './Avatar.jsx';
import { formatDate, formatNumber } from '../lib/i18n.js';

// #region project
export const projectCardClasses = {
  root:
    'group relative flex min-w-0 flex-col gap-4 rounded-leaf border border-subtle bg-surface p-card shadow-card ' +
    'transition-[translate,box-shadow,border-color] duration-base ease-flow ' +
    'hover:-translate-y-0.5 hover:border-strong hover:shadow-pop has-[a:focus-visible]:outline-2 has-[a:focus-visible]:-outline-offset-1 has-[a:focus-visible]:outline-ring ' +
    'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
  title: 'user-text font-display text-subheading font-semibold text-fg',
  link: 'outline-none after:absolute after:inset-0 after:rounded-[inherit] after:content-[""]',
  arrow: 'text-fg-subtle transition-[color,translate] duration-base ease-flow group-hover:text-fg-primary group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 motion-reduce:transition-none',
  description: 'user-text line-clamp-2 text-body-sm text-fg-muted',
  track: 'h-1.5 w-full overflow-hidden rounded-pill bg-surface-sunken',
  fill: 'h-full rounded-pill bg-primary transition-[width] duration-slow ease-flow motion-reduce:transition-none',
  meta: 'flex items-center justify-between gap-3 text-body-sm text-fg-muted',
};
// #endregion

export function ProjectCard({ name, description, href = '#', done = 0, total = 0, overdue = 0, members = [], updated, lang = 'en' }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  const t = (en, ar) => (lang === 'ar' ? ar : en);
  return (
    <article className={projectCardClasses.root}>
      <div className="flex items-start justify-between gap-3">
        <h3 className={projectCardClasses.title}>
          <Link to={href} className={projectCardClasses.link}>{name}</Link>
        </h3>
        <Icon icon={ArrowUpRight} size={20} mirror className={projectCardClasses.arrow} />
      </div>
      {description && <p className={projectCardClasses.description}>{description}</p>}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between text-body-sm">
          <span className="text-fg-muted">{t('Progress', 'الإنجاز')}</span>
          <span className="font-medium tabular-nums text-fg">
            {formatNumber(done, lang)}/{formatNumber(total, lang)} · {pct}%
          </span>
        </div>
        <div className={projectCardClasses.track} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={t('Progress', 'الإنجاز')}>
          <div className={projectCardClasses.fill} style={{ width: pct + '%' }} />
        </div>
      </div>
      <div className={projectCardClasses.meta}>
        {members.length > 0 ? <AvatarStack names={members} label={t(members.length + ' members', members.length + ' أعضاء')} /> : <span />}
        {overdue > 0 ? (
          <span className="inline-flex items-center gap-1 font-medium text-danger-fg tabular-nums">
            <Icon icon={TriangleAlert} size={14} />
            {t(overdue + ' overdue', overdue + ' متأخرة')}
          </span>
        ) : (
          updated && <span className="tabular-nums">{t('Updated ', 'حُدّث ')}{formatDate(updated, lang)}</span>
        )}
      </div>
    </article>
  );
}

// #region stat
export const statCardClasses = variants({
  base: 'flex min-w-0 flex-col gap-3 rounded-leaf border border-subtle bg-surface p-card shadow-card',
  variants: { tone: { neutral: '', todo: '', progress: '', done: '', danger: '' } },
});
export const statIconClasses = variants({
  base: 'inline-flex size-9 items-center justify-center rounded-leaf-sm',
  variants: {
    tone: {
      neutral: 'bg-primary-soft text-fg-primary',
      todo: 'bg-status-todo-soft text-status-todo-fg',
      progress: 'bg-status-progress-soft text-status-progress-fg',
      done: 'bg-status-done-soft text-status-done-fg',
      danger: 'bg-danger-soft text-danger-fg',
    },
  },
  defaults: { tone: 'neutral' },
});
// #endregion

export function StatCard({ label, value, icon, tone = 'neutral', hint, lang = 'en' }) {
  return (
    <section className={statCardClasses({ tone })} aria-label={label}>
      <div className="flex items-center justify-between gap-3">
        {/* Not a heading: the card is a labelled section, and an h3 here made the page jump from h1 to h3. */}
        <p className="text-label font-medium text-fg-muted">{label}</p>
        {icon && (
          <span className={statIconClasses({ tone })}>
            <Icon icon={icon} size={20} />
          </span>
        )}
      </div>
      <p className="font-sans text-stat font-semibold tabular-nums text-fg">{formatNumber(value, lang)}</p>
      {hint && <p className="text-body-sm text-fg-muted">{hint}</p>}
    </section>
  );
}
