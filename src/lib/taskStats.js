import { isOverdue, todayISO } from './i18n.js';

/** { todo, in_progress, done } counts for a list of tasks. */
export function countByStatus(tasks) {
  const counts = { todo: 0, in_progress: 0, done: 0 };
  for (const task of tasks) if (task.status in counts) counts[task.status] += 1;
  return counts;
}

/** Progress numbers for one project's card: done / total, and how many are overdue. */
export function projectProgress(tasks, today = todayISO()) {
  return {
    done: tasks.filter((t) => t.status === 'done').length,
    total: tasks.length,
    overdue: tasks.filter((t) => isOverdue(t.dueDate, t.status, today)).length,
  };
}

/**
 * Dashboard numbers across every accessible project.
 * entries: [{ project, tasks }]. Overdue tasks come back oldest due date first.
 */
export function summarizeDashboard(entries, today = todayISO()) {
  const allTasks = entries.flatMap(({ project, tasks }) => tasks.map((task) => ({ task, project })));
  const overdue = allTasks
    .filter(({ task }) => isOverdue(task.dueDate, task.status, today))
    .sort((a, b) => a.task.dueDate.localeCompare(b.task.dueDate) || a.task.title.localeCompare(b.task.title));
  return {
    projects: entries.length,
    total: allTasks.length,
    byStatus: countByStatus(allTasks.map((x) => x.task)),
    overdue,
  };
}
