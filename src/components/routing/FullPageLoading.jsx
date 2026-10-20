import { useEffect, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { Icon } from '../../lib/icons.jsx';
import { Loading } from '../States.jsx';
import { usePrefs } from '../../context/PreferencesContext.jsx';

// Auth usually resolves in well under a second after a refresh, so a spinner would only flash.
// Keep the screen blank and show it only when loading is actually slow.
const SPINNER_DELAY_MS = 1000;

export function FullPageLoading() {
  const { t } = usePrefs();
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setSlow(true), SPINNER_DELAY_MS);
    return () => clearTimeout(id);
  }, []);

  return (
    <Loading label={t('Loading…', 'جارٍ التحميل…')} className="flex min-h-dvh items-center justify-center text-fg-muted">
      {slow && <Icon icon={LoaderCircle} size={32} className="animate-spin motion-reduce:animate-none" />}
    </Loading>
  );
}
