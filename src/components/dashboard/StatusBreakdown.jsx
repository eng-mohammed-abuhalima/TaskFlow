import { STATUS_LABELS } from '../Badges.jsx';
import { usePrefs } from '../../context/PreferencesContext.jsx';
import { formatNumber } from '../../lib/i18n.js';

const ROWS = [
  ['todo', 'bg-status-todo'],
  ['in_progress', 'bg-status-progress'],
  ['done', 'bg-status-done'],
];

/** Tasks by status: a proportion bar plus the three counts. counts = { todo, in_progress, done }. */
export function StatusBreakdown({ counts }) {
  const { t, lang } = usePrefs();
  const total = counts.todo + counts.in_progress + counts.done;
  return (
    <section className="flex flex-col gap-4 rounded-leaf border border-subtle bg-surface p-card shadow-card" aria-labelledby="by-status">
      <div className="flex items-baseline justify-between">
        <h2 id="by-status" className="text-label font-medium text-fg-muted">{t('Tasks by status', 'المهام حسب الحالة')}</h2>
        <span className="text-body-sm tabular-nums text-fg-muted">{formatNumber(total, lang)} {t('total', 'إجمالي')}</span>
      </div>
      <div className="flex h-2.5 gap-1 overflow-hidden rounded-pill bg-surface-sunken" aria-hidden="true">
        {total > 0 && ROWS.filter(([key]) => counts[key] > 0).map(([key, bg]) => (
          <span key={key} className={bg + ' h-full first:rounded-s-pill last:rounded-e-pill'} style={{ width: (counts[key] / total) * 100 + '%' }} />
        ))}
      </div>
      <dl className="grid grid-cols-3 gap-2">
        {ROWS.map(([key, bg]) => (
          <div key={key} className="flex flex-col gap-1">
            <dt className="flex items-center gap-1.5 text-body-sm text-fg-muted">
              <span className={'size-2 rounded-pill ' + bg} aria-hidden="true" />{STATUS_LABELS[lang][key]}
            </dt>
            <dd className="text-heading font-semibold tabular-nums text-fg">{formatNumber(counts[key], lang)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
