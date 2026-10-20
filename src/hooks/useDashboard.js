import { useCallback, useEffect, useState } from 'react';
import { listMyProjects } from '../services/projects.js';
import { listTasks } from '../services/tasks.js';

/**
 * Every project the user can access, each with its tasks: { status, entries: [{ project, tasks }] }.
 * status: 'loading' | 'ready' | 'error'. One failed read fails the whole load, so numbers are never partial.
 */
export function useDashboard(uid) {
  const [state, setState] = useState({ status: 'loading', entries: [] });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    listMyProjects(uid)
      .then((projects) => Promise.all(projects.map(async (project) => ({ project, tasks: await listTasks(project.id) }))))
      .then((entries) => active && setState({ status: 'ready', entries }))
      .catch(() => active && setState({ status: 'error', entries: [] }));
    return () => { active = false; };
  }, [uid, attempt]);

  const reload = useCallback(() => {
    setState({ status: 'loading', entries: [] });
    setAttempt((n) => n + 1);
  }, []);

  return { ...state, reload };
}
