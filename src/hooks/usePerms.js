import { useEffect, useState } from 'react';
import { subscribeToMyPerms, subscribeToProjectPerms } from '../services/perms.js';
import { DEFAULT_PERMS, PRESETS } from '../lib/permissions.js';

/**
 * The signed-in user's permissions in a project, live. The owner has all of them (no document needed);
 * a member gets theirs (or the default, "contributor", until it loads or when they have none).
 */
export function useMyPerms(project, uid) {
  const isOwner = project.ownerId === uid;
  const [perms, setPerms] = useState(DEFAULT_PERMS);
  useEffect(() => (isOwner ? undefined : subscribeToMyPerms(project.id, uid, setPerms)), [project.id, uid, isOwner]);
  return isOwner ? PRESETS.manager : perms;
}

/** Owner only (`enabled`): { status, byUid: { uid: perms } } for the settings page. */
export function useProjectPerms(projectId, enabled) {
  const [state, setState] = useState({ status: 'loading', byUid: {} });
  useEffect(() => {
    if (!enabled) return undefined;
    return subscribeToProjectPerms(
      projectId,
      (byUid) => setState({ status: 'ready', byUid }),
      () => setState({ status: 'error', byUid: {} })
    );
  }, [projectId, enabled]);
  return state;
}
