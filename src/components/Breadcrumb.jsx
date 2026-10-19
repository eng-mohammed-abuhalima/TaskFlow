import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Icon } from '../lib/icons.jsx';
import { usePrefs } from '../context/PreferencesContext.jsx';

/** items: [{ label, to? }]; the last item is the current page. */
export function Breadcrumb({ items }) {
  const { t } = usePrefs();
  return (
    <nav aria-label={t('Breadcrumb', 'مسار التنقل')}>
      <ol className="flex min-w-0 items-center gap-1.5 text-body-sm text-fg-muted">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex min-w-0 items-center gap-1.5">
              {i > 0 && <Icon icon={ChevronRight} size={14} mirror />}
              {last || !item.to ? (
                <span aria-current={last ? 'page' : undefined} className="user-text truncate font-medium text-fg">{item.label}</span>
              ) : (
                <Link to={item.to} className="user-text truncate rounded-tight hover:text-fg focus-ring">{item.label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
