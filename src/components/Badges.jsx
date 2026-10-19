import { Circle, CircleDashed, CircleCheck, CalendarDays, TriangleAlert } from 'lucide-react';
import { cx, variants } from '../lib/cx.js';
import { Icon } from '../lib/icons.jsx';
import { formatDate, isOverdue } from '../lib/i18n.js';

export const STATUS_LABELS = {
  en: { todo: 'To Do', in_progress: 'In Progress', done: 'Done' },
  ar: { todo: 'لم تبدأ', in_progress: 'قيد التنفيذ', done: 'مكتملة' },
};
export const PRIORITY_LABELS = {
  en: { low: 'Low', medium: 'Medium', high: 'High' },
  ar: { low: 'منخفضة', medium: 'متوسطة', high: 'عالية' },
};

// #region status
// Shape: pill. Meaning carried by icon + text, colour is the third cue.
export const statusClasses = variants({
  base: 'inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-pill ps-1.5 pe-2.5 text-caption font-medium',
  variants: {
    status: {
      todo: 'bg-status-todo-soft text-status-todo-fg',
      in_progress: 'bg-status-progress-soft text-status-progress-fg',
      done: 'bg-status-done-soft text-status-done-fg',
    },
  },
  defaults: { status: 'todo' },
});
export const statusIcon = {
  todo: { icon: Circle, className: 'text-status-todo' },
  in_progress: { icon: CircleDashed, className: 'text-status-progress' },
  done: { icon: CircleCheck, className: 'text-status-done' },
};
// #endregion

export function StatusBadge({ status = 'todo', lang = 'en', className }) {
  const s = statusIcon[status];
  return (
    <span className={statusClasses({ status, className })}>
      <Icon icon={s.icon} size={14} className={s.className} />
      {STATUS_LABELS[lang][status]}
    </span>
  );
}

// #region priority
// Shape: squared tag + signal bars (1/2/3 filled). Never confused with the status pill.
export const priorityClasses = variants({
  base: 'inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-tight border px-2 text-caption font-medium',
  variants: {
    priority: {
      low: 'border-subtle bg-priority-low-soft text-priority-low-fg',
      medium: 'border-priority-medium/40 bg-priority-medium-soft text-priority-medium-fg',
      high: 'border-priority-high/40 bg-priority-high-soft text-priority-high-fg',
    },
  },
  defaults: { priority: 'medium' },
});
export const priorityBar = { low: 'text-priority-low', medium: 'text-priority-medium', high: 'text-priority-high' };
// #endregion
const LEVEL = { low: 1, medium: 2, high: 3 };

export function Bars({ level, className }) {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" className={cx('shrink-0', className)}>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={1 + i * 4} y={8 - i * 3} width="2.5" height={3 + i * 3} rx="0.75" fill="currentColor" opacity={i < level ? 1 : 0.28} />
      ))}
    </svg>
  );
}

export function PriorityBadge({ priority = 'medium', lang = 'en', className }) {
  return (
    <span className={priorityClasses({ priority, className })}>
      <Bars level={LEVEL[priority]} className={priorityBar[priority]} />
      {PRIORITY_LABELS[lang][priority]}
    </span>
  );
}

// #region due
export const dueClasses = variants({
  base: 'inline-flex items-center gap-1.5 whitespace-nowrap text-body-sm tabular-nums',
  variants: {
    tone: {
      normal: 'text-fg-muted',
      overdue: 'h-6 rounded-tight bg-danger-soft px-2 font-medium text-danger-fg',
      done: 'text-fg-subtle',
    },
  },
  defaults: { tone: 'normal' },
});
// #endregion

export function DueDate({ due, status, lang = 'en', today, className }) {
  if (!due) return <span className={cx('text-body-sm text-fg-subtle', className)}>{lang === 'ar' ? 'بلا موعد' : 'No due date'}</span>;
  const overdue = isOverdue(due, status, today);
  const date = formatDate(due, lang);
  const tone = overdue ? 'overdue' : status === 'done' ? 'done' : 'normal';
  return (
    <span className={dueClasses({ tone, className })}>
      <Icon icon={overdue ? TriangleAlert : CalendarDays} size={14} />
      {overdue ? (
        <span>
          {lang === 'ar' ? 'متأخرة' : 'Overdue'} · <time dateTime={due}>{date}</time>
        </span>
      ) : (
        <time dateTime={due}>{date}</time>
      )}
    </span>
  );
}

/** Option lists with icons, for Select (status / priority / assignee). */
export const statusOptions = (lang) => Object.entries(STATUS_LABELS[lang]).map(([value, label]) => ({
  value, label, icon: <Icon icon={statusIcon[value].icon} size={16} className={statusIcon[value].className} />,
}));
export const priorityOptions = (lang) => Object.entries(PRIORITY_LABELS[lang]).map(([value, label]) => ({
  value, label, icon: <Bars level={LEVEL[value]} className={priorityBar[value]} />,
}));
