import { useEffect, useState } from 'react';
import { subscribeToTasks } from '../services/tasks.js';

/**
 * Live tasks of one project: { status: 'loading' | 'ready' | 'error', tasks }.
 * Creates, edits and deletes (from this tab or another member) show up without a reload.
 */
export function useTasks(projectId) {
  const [state, setState] = useState({ status: 'loading', tasks: [] });

  useEffect(
    () =>
      subscribeToTasks(
        projectId,
        (tasks) => setState({ status: 'ready', tasks }),
        () => setState({ status: 'error', tasks: [] })
      ),
    [projectId]
  );

  return state;
}
