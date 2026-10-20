import { useEffect, useState } from 'react';
import { subscribeToNotifications } from '../services/notifications.js';

export const NOTIFICATIONS_SHOWN = 30;

/** Live notifications of the signed-in user: { status, notes, unread }. */
export function useNotifications(uid) {
  const [state, setState] = useState({ status: 'loading', notes: [] });

  useEffect(() => {
    if (!uid) return undefined;
    return subscribeToNotifications(
      uid,
      NOTIFICATIONS_SHOWN,
      (notes) => setState({ status: 'ready', notes }),
      () => setState({ status: 'error', notes: [] })
    );
  }, [uid]);

  return { ...state, unread: state.notes.filter((n) => !n.read).length };
}
