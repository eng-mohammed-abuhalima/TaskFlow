import { WifiOff } from 'lucide-react';
import { Icon } from '../lib/icons.jsx';
import { cx } from '../lib/cx.js';
import { useOnlineStatus } from '../lib/network.js';
import { usePrefs } from '../context/PreferencesContext.jsx';

/** Shown across the top while the browser is offline. Saving is refused meanwhile (see lib/network.js). */
export function OfflineBanner({ className }) {
  const online = useOnlineStatus();
  const { t } = usePrefs();
  if (online) return null;
  return (
    <div role="status" className={cx('flex items-center justify-center gap-2 border-b border-warning/50 bg-warning-soft px-4 py-2 text-center text-body-sm font-medium text-warning-fg', className)}>
      <Icon icon={WifiOff} size={16} />
      <span>{t('You’re offline. Changes can’t be saved until you reconnect.', 'أنت غير متصل بالإنترنت. لا يمكن حفظ التغييرات حتى يعود الاتصال.')}</span>
    </div>
  );
}
