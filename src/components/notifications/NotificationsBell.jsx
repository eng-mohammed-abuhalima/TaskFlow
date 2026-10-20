import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Popover from '@radix-ui/react-popover';
import { Bell, BellOff, CheckCheck, CloudOff } from 'lucide-react';
import { Button } from '../Button.jsx';
import { navbarClasses } from '../Navbar.jsx';
import { Icon } from '../../lib/icons.jsx';
import { cx } from '../../lib/cx.js';
import { dayLabel, formatNumber, formatTime, timestampToISO, todayISO } from '../../lib/i18n.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { usePrefs } from '../../context/PreferencesContext.jsx';
import { useNotifications } from '../../hooks/useNotifications.js';
import { canDecline, markRead } from '../../services/notifications.js';
import { NotificationSentence, Reason } from '../activity/sentences.jsx';
import { DeclineDialog } from './DeclineDialog.jsx';

export const notificationClasses = {
  badge:
    'pointer-events-none absolute -top-0.5 -end-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-pill ' +
    'bg-danger px-1 text-caption font-semibold tabular-nums text-on-danger ring-2 ring-surface',
  panel:
    'z-50 flex max-h-[min(32rem,calc(100dvh-5rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden ' +
    'rounded-leaf border border-subtle bg-surface-raised text-fg shadow-pop data-[state=open]:animate-pop-in motion-reduce:animate-none',
  header: 'flex items-center justify-between gap-2 border-b border-subtle px-4 py-3',
  list: 'flex-1 overflow-y-auto [&>li+li]:border-t [&>li+li]:border-subtle',
  item: 'relative flex flex-col gap-1.5 px-4 py-3 text-body-sm text-fg-muted',
  unread: 'bg-primary-soft/40',
  dot: 'absolute start-1.5 top-4.5 size-2 rounded-pill bg-primary',
  actions: 'mt-1 flex flex-wrap items-center gap-2',
  link: 'rounded-tight text-label font-medium text-fg-primary underline decoration-1 underline-offset-4 hover:decoration-2 focus-ring',
  declined: 'inline-flex items-center rounded-pill bg-surface-sunken px-2 py-0.5 text-caption font-medium text-fg-muted',
};

/**
 * Bell in the navbar with the unread count. Opening it lists the latest notifications; closing it
 * marks them read. A fresh assignment or invitation can be declined with a reason from here.
 */
export function NotificationsBell() {
  const { user } = useAuth();
  const { t, lang } = usePrefs();
  const navigate = useNavigate();
  const { status, notes, unread } = useNotifications(user.uid);
  const [open, setOpen] = useState(false);
  const [declining, setDeclining] = useState(null);
  const today = todayISO();

  // Seen = read. Failing to save that (offline) only means the badge stays; nothing to report.
  const markSeen = (list) => markRead(user.uid, list.filter((n) => !n.read).map((n) => n.id)).catch(() => {});

  function handleOpenChange(next) {
    setOpen(next);
    if (!next) markSeen(notes);
  }
  function openProject(note) {
    handleOpenChange(false);
    navigate(`/projects/${note.projectId}`);
  }
  function startDecline(note) {
    handleOpenChange(false);
    setDeclining(note);
  }

  const count = unread > 9 ? '9+' : formatNumber(unread, lang);
  const label = unread
    ? t(`Notifications, ${unread} unread`, `الإشعارات، ${formatNumber(unread, lang)} غير مقروءة`)
    : t('Notifications', 'الإشعارات');

  return (
    <>
      <Popover.Root open={open} onOpenChange={handleOpenChange}>
        <Popover.Trigger className={cx(navbarClasses.tool, 'relative')} aria-label={label} title={t('Notifications', 'الإشعارات')}>
          <Icon icon={Bell} size={20} />
          {unread > 0 && <span className={notificationClasses.badge} aria-hidden="true">{count}</span>}
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content align="end" sideOffset={8} collisionPadding={16} className={notificationClasses.panel}
            aria-label={t('Notifications', 'الإشعارات')}>
            <div className={notificationClasses.header}>
              <h2 className="font-display text-subheading font-semibold text-fg">{t('Notifications', 'الإشعارات')}</h2>
              {unread > 0 && (
                <Button variant="ghost" size="sm" icon={CheckCheck} onClick={() => markSeen(notes)}>
                  {t('Mark all as read', 'تعليم الكل كمقروء')}
                </Button>
              )}
            </div>

            {status === 'error' ? (
              <Empty icon={CloudOff}>{t('Couldn’t load notifications. Check your connection.', 'تعذّر تحميل الإشعارات. تحقق من الاتصال.')}</Empty>
            ) : status === 'loading' ? (
              <Empty>{t('Loading…', 'جارٍ التحميل…')}</Empty>
            ) : notes.length === 0 ? (
              <Empty icon={BellOff}>{t('No notifications yet. You’ll see tasks assigned to you and project invitations here.', 'لا توجد إشعارات بعد. ستظهر هنا المهام المسندة إليك ودعوات المشاريع.')}</Empty>
            ) : (
              <ul className={notificationClasses.list}>
                {notes.map((note) => {
                  const day = timestampToISO(note.at);
                  return (
                    <li key={note.id} className={cx(notificationClasses.item, !note.read && notificationClasses.unread)}>
                      {!note.read && (
                        <>
                          <span className={notificationClasses.dot} aria-hidden="true" />
                          <span className="sr-only">{t('Unread:', 'غير مقروء:')}</span>
                        </>
                      )}
                      <p className="break-words"><NotificationSentence note={note} lang={lang} /></p>
                      {note.reason && <Reason text={note.reason} lang={lang} />}
                      <time className="text-caption tabular-nums text-fg-subtle" dateTime={note.at?.toDate?.().toISOString()}>
                        {dayLabel(day, lang, today)} · {formatTime(note.at, lang)}
                      </time>
                      <div className={notificationClasses.actions}>
                        {note.response !== 'declined' && (
                          <button type="button" className={notificationClasses.link} onClick={() => openProject(note)}>
                            {t('Open project', 'فتح المشروع')}
                          </button>
                        )}
                        {canDecline(note) && (
                          <Button variant="ghost" size="sm" onClick={() => startDecline(note)} className="text-danger-fg">
                            {note.type === 'task_assigned' ? t('Decline…', 'رفض…') : t('Decline and leave…', 'الاعتذار والمغادرة…')}
                          </Button>
                        )}
                        {note.response === 'declined' && (
                          <span className={notificationClasses.declined}>{t('Declined', 'تم الرفض')}</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <DeclineDialog note={declining} uid={user.uid} onClose={() => setDeclining(null)} />
    </>
  );
}

function Empty({ icon, children }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-10 text-center text-body-sm text-fg-muted">
      {icon && <Icon icon={icon} size={24} className="text-fg-subtle" />}
      <p>{children}</p>
    </div>
  );
}
