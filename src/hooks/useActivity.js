import { useEffect, useState } from 'react';
import { subscribeToActivity } from '../services/activity.js';

export const ACTIVITY_PAGE = 50;

/**
 * Live activity log of a project (owner only): { status: 'loading' | 'ready' | 'error', entries, hasMore }.
 * `pages` grows with "Show more"; the listener is simply re-opened with a bigger limit.
 */
export function useActivity(projectId, pages = 1) {
  const [state, setState] = useState({ status: 'loading', entries: [], hasMore: false });

  useEffect(
    () =>
      subscribeToActivity(
        projectId,
        pages * ACTIVITY_PAGE,
        (entries, hasMore) => setState({ status: 'ready', entries, hasMore }),
        () => setState({ status: 'error', entries: [], hasMore: false })
      ),
    [projectId, pages]
  );

  return state;
}
