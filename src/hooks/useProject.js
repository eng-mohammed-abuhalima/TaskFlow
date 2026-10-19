import { useCallback, useEffect, useState } from 'react';
import { getProject } from '../services/projects.js';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Loads one project and reduces the outcome to a single status:
 * 'loading' | 'ready' | 'notFound' | 'denied' | 'error'.
 * Non-members never receive the project data: the rules reject the read.
 */
export function useProject(id) {
  const { user } = useAuth();
  const [state, setState] = useState({ status: 'loading', project: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    getProject(id)
      .then((project) => {
        if (!active) return;
        setState(project ? { status: 'ready', project } : { status: 'notFound', project: null });
      })
      .catch((err) => {
        if (!active) return;
        setState({ status: err.code === 'permission-denied' ? 'denied' : 'error', project: null });
      });
    return () => { active = false; };
  }, [id, attempt]);

  const reload = useCallback(() => {
    setState({ status: 'loading', project: null });
    setAttempt((n) => n + 1);
  }, []);

  const { project } = state;
  return { ...state, isOwner: Boolean(project && user && project.ownerId === user.uid), reload };
}
