import { useCallback, useEffect, useState } from 'react';
import { subscribeToProject } from '../services/projects.js';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Live project, reduced to a single status:
 * 'loading' | 'ready' | 'notFound' | 'denied' | 'error'.
 * Non-members never receive the project data: the rules reject the read. A member who is removed
 * while the page is open flips to 'denied' on their own.
 */
export function useProject(id) {
  const { user } = useAuth();
  const [state, setState] = useState({ status: 'loading', project: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(
    () =>
      subscribeToProject(
        id,
        (project) => setState(project ? { status: 'ready', project } : { status: 'notFound', project: null }),
        (err) => setState({ status: err.code === 'permission-denied' ? 'denied' : 'error', project: null })
      ),
    [id, attempt]
  );

  const reload = useCallback(() => {
    setState({ status: 'loading', project: null });
    setAttempt((n) => n + 1);
  }, []);

  const { project } = state;
  return { ...state, isOwner: Boolean(project && user && project.ownerId === user.uid), reload };
}
