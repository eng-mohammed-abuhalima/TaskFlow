import { useState } from 'react';
import {
  CirclePlus, Pencil, ArrowRightLeft, UserCheck, UserX, Trash2, Ban, UserPlus, UserMinus, LogOut, Settings2, History, CloudOff, KeyRound,
} from 'lucide-react';
import { Button } from '../Button.jsx';
import { EmptyState, Loading, Skeleton } from '../States.jsx';
import { Icon } from '../../lib/icons.jsx';
import { cx } from '../../lib/cx.js';
import { dayLabel, formatTime, timestampToISO, todayISO } from '../../lib/i18n.js';
import { useActivity } from '../../hooks/useActivity.js';
import { ActivitySentence, Reason } from './sentences.jsx';

// Icon + tile tone per kind of change; the sentence carries the meaning, the icon is a second cue.
const KINDS = {
  task_created: { icon: CirclePlus, tone: 'bg-primary-soft text-fg-primary' },
  task_updated: { icon: Pencil, tone: 'bg-surface-sunken text-fg-muted' },
  task_status: { icon: ArrowRightLeft, tone: 'bg-status-progress-soft text-status-progress-fg' },
  task_assigned: { icon: UserCheck, tone: 'bg-info-soft text-info-fg' },
  task_unassigned: { icon: UserX, tone: 'bg-surface-sunken text-fg-muted' },
  task_deleted: { icon: Trash2, tone: 'bg-danger-soft text-danger-fg' },
  task_declined: { icon: Ban, tone: 'bg-warning-soft text-warning-fg' },
  member_added: { icon: UserPlus, tone: 'bg-success-soft text-success-fg' },
  member_removed: { icon: UserMinus, tone: 'bg-danger-soft text-danger-fg' },
  member_left: { icon: LogOut, tone: 'bg-warning-soft text-warning-fg' },
  project_updated: { icon: Settings2, tone: 'bg-surface-sunken text-fg-muted' },
  member_perms: { icon: KeyRound, tone: 'bg-accent-soft text-fg-accent' },
};
const FALLBACK = { icon: History, tone: 'bg-surface-sunken text-fg-muted' };

export const activityClasses = {
  day: 'flex flex-col gap-2',
  dayTitle: 'text-label font-medium text-fg-muted',
  // Same separators as the task list.
  list: 'flex flex-col overflow-hidden rounded-leaf border border-subtle bg-surface shadow-card [&>li+li]:border-t [&>li+li]:border-subtle',
  item: 'flex items-start gap-3 px-4 py-3',
  tile: 'mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-leaf-sm',
  text: 'min-w-0 flex-1 text-body-sm text-fg-muted',
  time: 'shrink-0 pt-0.5 text-caption tabular-nums text-fg-subtle',
};

/** Groups entries (newest first) into [{ day: 'YYYY-MM-DD', entries }], keeping the order. */
function byDay(entries) {
  const groups = [];
  for (const entry of entries) {
    const day = timestampToISO(entry.at);
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.entries.push(entry);
    else groups.push({ day, entries: [entry] });
  }
  return groups;
}

/** The owner's activity log for one project. */
export function ActivityFeed({ projectId, lang }) {
  const t = (en, ar) => (lang === 'ar' ? ar : en);
  const [pages, setPages] = useState(1);
  const { status, entries, hasMore } = useActivity(projectId, pages);
  const today = todayISO();

  if (status === 'loading' && entries.length === 0) {
    return (
      <Loading label={t('Loading activity…', 'جارٍ تحميل النشاط…')}>
        <ul className={activityClasses.list}>
          {[0, 1, 2].map((i) => (
            <li key={i} className={activityClasses.item} aria-hidden="true">
              <Skeleton className="size-8 rounded-leaf-sm" />
              <div className="flex flex-1 flex-col gap-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-1/4" /></div>
            </li>
          ))}
        </ul>
      </Loading>
    );
  }
  if (status === 'error') {
    return (
      <EmptyState icon={CloudOff} title={t('Couldn’t load the activity', 'تعذّر تحميل النشاط')}
        action={<Button variant="secondary" onClick={() => window.location.reload()}>{t('Reload', 'إعادة التحميل')}</Button>}>
        {t('Check your connection and try again.', 'تحقق من الاتصال وحاول مجددًا.')}
      </EmptyState>
    );
  }
  if (entries.length === 0) {
    return (
      <EmptyState icon={History} title={t('No activity yet', 'لا يوجد نشاط بعد')}>
        {t('Every change to tasks and members will be listed here, with who made it and when.',
          'ستظهر هنا كل التغييرات على المهام والأعضاء، مع من أجراها ومتى.')}
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {byDay(entries).map(({ day, entries: items }) => (
        <section key={day} className={activityClasses.day} aria-labelledby={`day-${day}`}>
          <h3 id={`day-${day}`} className={activityClasses.dayTitle}>{dayLabel(day, lang, today)}</h3>
          <ul className={activityClasses.list}>
            {items.map((entry) => {
              const kind = KINDS[entry.type] ?? FALLBACK;
              return (
                <li key={entry.id} className={activityClasses.item}>
                  <span className={cx(activityClasses.tile, kind.tone)}><Icon icon={kind.icon} size={16} /></span>
                  <div className={activityClasses.text}>
                    <p className="break-words"><ActivitySentence entry={entry} lang={lang} /></p>
                    {entry.reason && <Reason text={entry.reason} lang={lang} />}
                    {entry.message && <Reason text={entry.message} lang={lang} kind="message" />}
                  </div>
                  <time className={activityClasses.time} dateTime={entry.at?.toDate?.().toISOString()}>{formatTime(entry.at, lang)}</time>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      {hasMore && (
        <Button variant="secondary" className="self-center" onClick={() => setPages((p) => p + 1)}>
          {t('Show older activity', 'عرض النشاط الأقدم')}
        </Button>
      )}
    </div>
  );
}
