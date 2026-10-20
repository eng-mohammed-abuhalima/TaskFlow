import { useState } from 'react';
import { Button } from './Button.jsx';
import { usePrefs } from '../context/PreferencesContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { signInWithGoogle, isPopupDismissed } from '../services/users.js';

// Google's "G" mark. Its four colours are fixed by Google's branding rules, so they are the one
// place in the app that uses raw hex instead of tokens.
// Takes the props Button's <Icon> passes (size, className, …); strokeWidth doesn't apply to a filled mark.
function GoogleMark({ size = 16, className }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" focusable="false" className={className}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

/**
 * "or" divider + "Continue with Google". Signs in or creates the account in one step.
 * onError(error | null): the page shows the message in its own alert (null clears it).
 * onBusyChange(bool): lets the page lock its form while the popup is open.
 */
export function GoogleSignIn({ remember = true, disabled, onError, onBusyChange }) {
  const { t } = usePrefs();
  const { setRegistering, refreshUser } = useAuth();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    onError?.(null);
    setBusy(true);
    onBusyChange?.(true);
    // Holds PublicOnlyRoute's redirect until a first-time user's profile is written.
    setRegistering(true);
    try {
      await signInWithGoogle({ remember });
      refreshUser();
    } catch (err) {
      if (!isPopupDismissed(err)) onError?.(err);
    } finally {
      setBusy(false);
      onBusyChange?.(false);
      setRegistering(false); // signed in: PublicOnlyRoute now sends the user on
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 text-body-sm text-fg-muted">
        <span className="flex-1 border-t border-subtle" />
        {t('or', 'أو')}
        <span className="flex-1 border-t border-subtle" />
      </div>
      <Button variant="secondary" size="lg" className="w-full" loading={busy} disabled={disabled}
        icon={GoogleMark} onClick={handleClick}>
        {t('Continue with Google', 'المتابعة باستخدام Google')}
      </Button>
    </div>
  );
}
