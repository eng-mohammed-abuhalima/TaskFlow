import { Pencil, Trash2 } from 'lucide-react';
import { cx } from '../lib/cx.js';
import { Avatar } from './Avatar.jsx';
import { StatusBadge, PriorityBadge, DueDate } from './Badges.jsx';
import { Button } from './Button.jsx';
import { isOverdue } from '../lib/i18n.js';

// #region classes
export const taskListClasses = 'overflow-hidden rounded-leaf border border-subtle bg-surface shadow-card [&>li+li]:border-t [&>li+li]:border-subtle';
export const taskRowClasses = {
  root:
    'group grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2.5 px-4 py-3.5 transition-colors duration-fast ease-flow hover:bg-surface-hover ' +
    'lg:grid-cols-[minmax(0,1fr)_9rem_6.5rem_8.5rem_7.5rem_auto] lg:items-center lg:gap-4 motion-reduce:transition-none',
  title: 'user-text break-words text-body font-medium text-fg',
  titleDone: 'text-fg-muted',
  desc: 'user-text mt-0.5 line-clamp-1 text-body-sm text-fg-muted',
  meta: 'col-span-2 flex flex-wrap items-center gap-x-3 gap-y-2 lg:contents',
  assignee: 'inline-flex min-w-0 items-center gap-2 text-body-sm text-fg-muted',
  actions: 'col-start-2 row-start-1 flex items-center gap-0.5 lg:col-start-auto lg:row-start-auto',
};
// #endregion

export function TaskRow({ task, lang = 'en', today, canEdit = true, canDelete = true, onEdit, onDelete }) {
  const { title, description, status, priority, due, assignee } = task;
  const t = (en, ar) => (lang === 'ar' ? ar : en);
  return (
    <li className={taskRowClasses.root}>
      <div className="min-w-0">
        <p className={cx(taskRowClasses.title, status === 'done' && taskRowClasses.titleDone)}>{title}</p>
        {description && <p className={taskRowClasses.desc}>{description}</p>}
      </div>
      <div className={taskRowClasses.meta}>
        <span className={taskRowClasses.assignee}>
          {assignee ? (
            <>
              <Avatar name={assignee} size="sm" />
              <span className="truncate">{assignee}</span>
            </>
          ) : (
            <span className="text-fg-subtle">{t('Unassigned', 'غير مُسندة')}</span>
          )}
        </span>
        <span className="inline-flex"><PriorityBadge priority={priority} lang={lang} /></span>
        <span className="inline-flex"><DueDate due={due} status={status} lang={lang} today={today} /></span>
        <span className="inline-flex"><StatusBadge status={status} lang={lang} /></span>
      </div>
      <div className={taskRowClasses.actions}>
        {canEdit && <Button variant="ghost" size="sm" iconOnly icon={Pencil} aria-label={t('Edit ', 'تعديل ') + title} onClick={onEdit} />}
        {canDelete && <Button variant="ghost" size="sm" iconOnly icon={Trash2} aria-label={t('Delete ', 'حذف ') + title} onClick={onDelete} className="hover:text-danger-fg" />}
      </div>
    </li>
  );
}

export function TaskList({ tasks = [], lang, today, label, ...rowProps }) {
  return (
    <ul className={taskListClasses} aria-label={label}>
      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} lang={lang} today={today} {...rowProps} />
      ))}
    </ul>
  );
}
export { isOverdue };
