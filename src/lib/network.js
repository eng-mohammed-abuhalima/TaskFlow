import { useSyncExternalStore } from 'react';

/** False only when the browser says it is offline (it can still be "online" with no real internet). */
export const isOnline = () => typeof navigator === 'undefined' || navigator.onLine !== false;

const subscribe = (onChange) => {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
};

/** Re-renders when the browser goes online or offline. */
export const useOnlineStatus = () => useSyncExternalStore(subscribe, isOnline, () => true);

/** A save that could not be confirmed. code: 'offline' | 'timeout'. */
export class NetworkError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

export const WRITE_TIMEOUT_MS = 12000;
/** For operations made of several writes (deleting a project with many tasks, removing a member). */
export const LONG_WRITE_TIMEOUT_MS = 30000;

/**
 * Runs a Firestore write so that "no connection" is a visible failure, not a spinner that never ends.
 * Firestore keeps a write offline and waits for the server forever, so we:
 *  - refuse to start it when the browser is offline (nothing is queued, so nothing is saved later), and
 *  - stop waiting after `timeoutMs` when we're "online" but the server doesn't answer. In that rare case
 *    the write may still go through once the connection returns, so the message tells the user to check.
 */
export async function guardedWrite(run, timeoutMs = WRITE_TIMEOUT_MS) {
  if (!isOnline()) throw new NetworkError('offline');
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new NetworkError('timeout')), timeoutMs);
  });
  try {
    return await Promise.race([run(), timeout]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * The text to show when a save fails. `generic` is the context's own fallback.
 * Returns a bilingual message that says what happened and what to do next.
 */
export function writeErrorMessage(error, t, generic) {
  if (error instanceof NetworkError) {
    return error.code === 'offline'
      ? t('You’re offline, so nothing was saved. Reconnect and try again.', 'أنت غير متصل بالإنترنت، فلم يُحفظ شيء. أعد الاتصال وحاول مجددًا.')
      : t('We couldn’t confirm the save. Check your connection, look at the list, then try again if it’s missing.', 'تعذّر تأكيد الحفظ. تحقق من الاتصال وراجع القائمة، ثم أعد المحاولة إن لم يظهر.');
  }
  return generic ?? t('Check your connection and try again. Nothing was saved.', 'تحقق من الاتصال وحاول مجددًا. لم يُحفظ شيء.');
}
