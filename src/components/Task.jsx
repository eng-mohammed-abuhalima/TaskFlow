import { ChevronDown, Pencil, Trash2 } from 'lucide-react';
import { cx } from '../lib/cx.js';
import { Icon } from '../lib/icons.jsx';
import { Avatar } from './Avatar.jsx';
import { StatusBadge, PriorityBadge, DueDate, STATUS_LABELS } from './Badges.jsx';
import { Button } from './Button.jsx';
import { isOverdue } from '../lib/i18n.js';

// #region classes
// @container: a row lays out by the width of the list, not the screen (the chat column can narrow it).
export const taskListClasses = '@container overflow-hidden rounded-leaf border border-subtle bg-surface shadow-card [&>li+li]:border-t [&>li+li]:border-subtle';
export const taskRowClasses = {
  root:
    'group grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2.5 px-4 py-3.5 transition-colors duration-fast ease-flow hover:bg-surface-hover ' +
    '@min-[56rem]:grid-cols-[minmax(0,1fr)_9rem_6.5rem_8.5rem_7.5rem_auto] @min-[56rem]:items-center @min-[56rem]:gap-4 motion-reduce:transition-none',
  title: 'user-text break-words text-body font-medium text-fg',
  titleDone: 'text-fg-muted',
  desc: 'user-text mt-0.5 line-clamp-1 text-body-sm text-fg-muted',
  meta: 'col-span-2 flex flex-wrap items-center gap-x-3 gap-y-2 @min-[56rem]:contents',
  assignee: 'inline-flex min-w-0 items-center gap-2 text-body-sm text-fg-muted',
  actions: 'col-start-2 row-start-1 flex items-center gap-0.5 @min-[56rem]:col-start-auto @min-[56rem]:row-start-auto',
  // The status pill doubles as the "change status" button for those allowed to change it.
  statusButton:
    'inline-flex items-center gap-0.5 rounded-pill pe-1 text-fg-muted transition-colors duration-fast hover:bg-surface-hover hover:text-fg ' +
    'focus-ring touch-target motion-reduce:transition-none',
};
// #endregion

export function TaskRow({ task, lang = 'en', today, canEdit = true, canDelete = true, canChangeStatus = false, onEdit, onDelete, onChangeStatus }) {
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
        <span className="inline-flex">
          {canChangeStatus ? (
            <button type="button" className={taskRowClasses.statusButton} onClick={onChangeStatus}
              aria-label={t(`Change status of ${title} (now ${STATUS_LABELS.en[status]})`, `تغيير حالة ${title} (حاليًا ${STATUS_LABELS.ar[status]})`)}
              title={t('Change status', 'تغيير الحالة')}>
              <StatusBadge status={status} lang={lang} />
              <Icon icon={ChevronDown} size={14} />
            </button>
          ) : (
            <StatusBadge status={status} lang={lang} />
          )}
        </span>
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
