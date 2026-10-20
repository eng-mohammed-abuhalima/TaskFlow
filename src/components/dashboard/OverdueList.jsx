import { Link } from 'react-router-dom';
import { ChevronRight, CircleCheck, TriangleAlert } from 'lucide-react';
import { Icon } from '../../lib/icons.jsx';
import { Avatar } from '../Avatar.jsx';
import { DueDate, PriorityBadge } from '../Badges.jsx';
import { usePrefs } from '../../context/PreferencesContext.jsx';
import { formatNumber } from '../../lib/i18n.js';
import { memberName } from '../../lib/members.js';

const MAX_SHOWN = 8;

/** Overdue tasks across all projects, oldest due date first. items = [{ task, project }]. */
export function OverdueList({ items, today }) {
  const { t, lang } = usePrefs();
  const shown = items.slice(0, MAX_SHOWN);
  const hidden = items.length - shown.length;
  return (
    <section className="flex flex-col rounded-leaf border border-subtle bg-surface shadow-card" aria-labelledby="overdue">
      <div className="flex items-center justify-between gap-3 border-b border-subtle px-card py-4">
        <h2 id="overdue" className="flex items-center gap-2 font-display text-heading font-semibold text-fg">
          <Icon icon={TriangleAlert} size={20} className="text-danger" />
          {t('Overdue', 'المتأخرة')}
        </h2>
        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-pill bg-danger-soft px-2 text-caption font-semibold tabular-nums text-danger-fg">
          {formatNumber(items.length, lang)}
        </span>
      </div>
      {items.length === 0 ? (
        <p className="flex items-center gap-2 px-card py-6 text-body-sm text-fg-muted">
          <Icon icon={CircleCheck} size={20} className="text-success" />
          {t('Nothing is overdue.', 'لا توجد مهام متأخرة.')}
        </p>
      ) : (
        <ul className="[&>li+li]:border-t [&>li+li]:border-subtle">
          {shown.map(({ task, project }) => {
            const assignee = task.assigneeId && memberName(project, task.assigneeId);
            return (
              <li key={`${project.id}/${task.id}`}>
                <Link to={`/projects/${project.id}`} className="group flex items-center gap-3 rounded-tight px-card py-3 hover:bg-surface-hover focus-ring">
                  <div className="min-w-0 flex-1">
                    <p className="user-text truncate text-body font-medium text-fg">{task.title}</p>
                    <p className="user-text truncate text-body-sm text-fg-muted">{project.name}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-body-sm text-fg-muted">
                      <DueDate due={task.dueDate} status={task.status} lang={lang} today={today} />
                      <PriorityBadge priority={task.priority} lang={lang} />
                    </p>
                  </div>
                  {assignee && <Avatar name={assignee} size="sm" />}
                  <Icon icon={ChevronRight} mirror className="text-fg-subtle" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {hidden > 0 && (
        <p className="border-t border-subtle px-card py-3 text-body-sm text-fg-muted">
          {t(`and ${formatNumber(hidden, lang)} more`, `و${formatNumber(hidden, lang)} أخرى`)}
        </p>
      )}
    </section>
  );
}
