import { isOverdue, todayISO } from './i18n.js';

export const ALL = 'all';
export const NO_ASSIGNEE = 'none';
export const DEFAULT_FILTERS = { q: '', status: ALL, priority: ALL, assignee: ALL, overdue: false };

/** True when any filter narrows the list (drives the "Clear" button and the empty-result message). */
export const hasActiveFilters = ({ q, status, priority, assignee, overdue } = DEFAULT_FILTERS) =>
  Boolean(q.trim()) || status !== ALL || priority !== ALL || assignee !== ALL || Boolean(overdue);

/**
 * Client-side filtering of a project's tasks (SRS FR-13). Every filter is optional and they combine with AND.
 *  q        case-insensitive match inside the title
 *  status   'all' | 'todo' | 'in_progress' | 'done'
 *  priority 'all' | 'low' | 'medium' | 'high'
 *  assignee 'all' | 'none' (unassigned) | a member uid
 *  overdue  true = only incomplete tasks whose due date is before today (app timezone)
 */
export function filterTasks(tasks, filters = DEFAULT_FILTERS, today = todayISO()) {
  const { q = '', status = ALL, priority = ALL, assignee = ALL, overdue = false } = filters;
  const needle = q.trim().toLowerCase();
  return tasks.filter(
    (task) =>
      (!needle || task.title.toLowerCase().includes(needle)) &&
      (status === ALL || task.status === status) &&
      (priority === ALL || task.priority === priority) &&
      (assignee === ALL || (assignee === NO_ASSIGNEE ? !task.assigneeId : task.assigneeId === assignee)) &&
      (!overdue || isOverdue(task.dueDate, task.status, today))
  );
}
