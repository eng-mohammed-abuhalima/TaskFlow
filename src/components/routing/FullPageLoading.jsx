import { LoaderCircle } from 'lucide-react';
import { Icon } from '../../lib/icons.jsx';
import { Loading } from '../States.jsx';
import { usePrefs } from '../../context/PreferencesContext.jsx';

export function FullPageLoading() {
  const { t } = usePrefs();
  return (
    <Loading label={t('Loading…', 'جارٍ التحميل…')} className="flex min-h-dvh items-center justify-center text-fg-muted">
      <Icon icon={LoaderCircle} size={32} className="animate-spin motion-reduce:animate-none" />
    </Loading>
  );
}
