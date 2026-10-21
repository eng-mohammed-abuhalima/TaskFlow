import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowDown, Check, CheckCheck, Clock, MessagesSquare, Trash2 } from 'lucide-react';
import { Avatar } from '../Avatar.jsx';
import { Icon } from '../../lib/icons.jsx';
import { cx } from '../../lib/cx.js';
import { dayLabel, formatNumber, formatTime, timestampToISO, todayISO } from '../../lib/i18n.js';

export const chatClasses = {
  list: 'relative flex-1 overflow-y-auto overscroll-contain bg-canvas px-3 py-4 [scrollbar-width:thin]',
  day: 'sticky top-0 z-10 mx-auto my-3 w-fit rounded-pill border border-subtle bg-surface-raised px-3 py-0.5 text-caption text-fg-muted shadow-card',
  // Full width, so the bubble's 85% is of the panel (flex-row-reverse puts my bubbles on the end side).
  row: 'group flex w-full items-end gap-2 animate-chat-message motion-reduce:animate-none',
  bubble:
    'relative max-w-[85%] rounded-card px-3 pt-1.5 pb-1 text-body-sm shadow-card',
  mine: 'bg-primary text-on-primary',
  theirs: 'border border-subtle bg-surface-raised text-fg',
  text: 'user-text whitespace-pre-wrap break-words',
  meta: 'mt-0.5 flex items-center justify-end gap-1 text-caption tabular-nums',
  tool:
    'inline-flex size-7 shrink-0 items-center justify-center rounded-pill text-fg-subtle opacity-0 transition-opacity duration-fast ' +
    'hover:bg-danger-soft hover:text-danger-fg focus:opacity-100 group-hover:opacity-100 focus-ring touch-target [@media(hover:none)]:opacity-100',
  ticks: 'inline-flex items-center rounded-tight focus-ring touch-target',
  seen: 'mt-1 max-w-[85%] text-caption text-fg-muted',
  jump:
    'absolute bottom-3 end-3 z-10 inline-flex h-9 items-center gap-1.5 rounded-pill bg-primary ps-3 pe-3.5 text-label font-medium ' +
    'text-on-primary shadow-pop hover:bg-primary-hover focus-ring animate-chat-message motion-reduce:animate-none',
};

const GROUP_GAP_MS = 5 * 60 * 1000;
const NEAR_BOTTOM_PX = 80;

/**
 * The conversation, oldest at the top. Sticks to the bottom while you're there; if you've scrolled up,
 * new messages show a "New messages" button instead of yanking you down. Loading older ones keeps
 * your place. role="log" makes screen readers announce new messages.
 */
export function MessageList({ chat, uid, ownerId, isOwner, nameOf, memberIds, t, lang, onDelete }) {
  const ref = useRef(null);
  const nearBottom = useRef(true);
  const prepend = useRef(null);
  const lastId = useRef(null);
  const [newCount, setNewCount] = useState(0);
  const [openSeen, setOpenSeen] = useState(null);
  const { messages } = chat;
  const today = todayISO();

  const toBottom = (smooth) => {
    const el = ref.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  };

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Older messages were added on top: keep the same message under the reader's eyes.
    if (prepend.current) {
      el.scrollTop = el.scrollHeight - prepend.current.height + prepend.current.top;
      prepend.current = null;
    }
    const last = messages.at(-1);
    if (!last || last.id === lastId.current) return;
    const first = lastId.current === null;
    lastId.current = last.id;
    if (first || nearBottom.current || last.authorId === uid) {
      toBottom(!first);
      setNewCount(0);
    } else {
      setNewCount((n) => n + 1);
    }
  }, [messages, uid]);

  // The panel can open with the list already loaded (e.g. reopening): start at the newest message.
  useEffect(() => toBottom(false), []);

  function handleScroll() {
    const el = ref.current;
    nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
    if (nearBottom.current) setNewCount(0);
  }

  function loadOlder() {
    const el = ref.current;
    prepend.current = { height: el.scrollHeight, top: el.scrollTop };
    chat.loadOlder();
  }

  const others = (m) => memberIds.filter((id) => id !== m.authorId);

  let prev = null;
  const items = [];
  for (const m of messages) {
    const day = timestampToISO(m.createdAt);
    const newDay = !prev || timestampToISO(prev.createdAt) !== day;
    const groupStart = newDay || prev.authorId !== m.authorId || m.createdAt - prev.createdAt > GROUP_GAP_MS;
    if (newDay) items.push(<li key={'d' + day} className={chatClasses.day} role="separator">{dayLabel(day, lang, today)}</li>);
    items.push(
      <Message
        key={m.id}
        m={m}
        mine={m.authorId === uid}
        groupStart={groupStart}
        isOwnerMsg={m.authorId === ownerId}
        canDelete={m.authorId === uid || isOwner}
        seenBy={chat.seenBy(m)}
        others={others(m)}
        nameOf={nameOf}
        seenOpen={openSeen === m.id}
        onToggleSeen={() => setOpenSeen((id) => (id === m.id ? null : m.id))}
        onDelete={() => onDelete(m)}
        t={t}
        lang={lang}
      />
    );
    prev = m;
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div ref={ref} className={chatClasses.list} onScroll={handleScroll}>
        {chat.hasMore && (
          <div className="mb-2 flex justify-center">
            <button type="button" onClick={loadOlder}
              className="rounded-pill px-3 py-1 text-label font-medium text-fg-primary hover:bg-surface-hover focus-ring">
              {t('Load earlier messages', 'تحميل الرسائل الأقدم')}
            </button>
          </div>
        )}
        {chat.status === 'ready' && messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="inline-flex size-14 items-center justify-center rounded-leaf bg-primary-soft text-fg-primary">
              <Icon icon={MessagesSquare} size={28} />
            </span>
            <p className="font-display text-subheading font-semibold text-fg">{t('No messages yet', 'لا توجد رسائل بعد')}</p>
            <p className="text-body-sm text-fg-muted">
              {t('Say hello to the team. Every member of this project sees this chat.', 'ألقِ التحية على الفريق. كل أعضاء هذا المشروع يرون هذه الدردشة.')}
            </p>
          </div>
        ) : (
          <ol role="log" aria-live="polite" aria-label={t('Messages', 'الرسائل')} className="flex flex-col gap-0.5">
            {items}
          </ol>
        )}
      </div>
      {newCount > 0 && (
        <button type="button" className={chatClasses.jump} onClick={() => { toBottom(true); setNewCount(0); }}>
          <Icon icon={ArrowDown} size={16} />
          {t(`New messages (${newCount})`, `رسائل جديدة (${formatNumber(newCount, lang)})`)}
        </button>
      )}
    </div>
  );
}

function Message({ m, mine, groupStart, isOwnerMsg, canDelete, seenBy, others, nameOf, seenOpen, onToggleSeen, onDelete, t, lang }) {
  const name = m.authorName || t('Former member', 'عضو سابق');
  const allSeen = others.length > 0 && seenBy.length === others.length;
  const time = formatTime(m.createdAt, lang);
  const tick = m.pending
    ? { icon: Clock, label: t('Sending', 'جارٍ الإرسال') }
    : allSeen
      ? { icon: CheckCheck, label: t('Seen by everyone', 'شاهدها الجميع') }
      : { icon: Check, label: t(`Sent, seen by ${seenBy.length} of ${others.length}`, `أُرسلت، شاهدها ${formatNumber(seenBy.length, lang)} من ${formatNumber(others.length, lang)}`) };
  const notYet = others.filter((id) => !seenBy.includes(id));

  const del = canDelete && !m.pending && (
    <button type="button" className={chatClasses.tool} onClick={onDelete} aria-label={t('Delete message', 'حذف الرسالة')} title={t('Delete message', 'حذف الرسالة')}>
      <Icon icon={Trash2} size={14} />
    </button>
  );

  return (
    <li className={cx('flex flex-col', mine ? 'items-end' : 'items-start', groupStart && 'mt-2.5')}>
      {!mine && groupStart && (
        <span className="mb-1 ms-9 flex items-center gap-1.5 text-caption font-medium text-fg-muted">
          <span className="user-text">{name}</span>
          {isOwnerMsg && <span className="text-fg-accent">· {t('Owner', 'المالك')}</span>}
        </span>
      )}
      <div className={cx(chatClasses.row, mine && 'flex-row-reverse')}>
        {!mine && (groupStart ? <Avatar name={name} size="sm" /> : <span className="w-7 shrink-0" aria-hidden="true" />)}
        <div
          className={cx(
            chatClasses.bubble,
            mine ? chatClasses.mine : chatClasses.theirs,
            // The tail: a tight corner at the top, on the sender's side, for the first bubble of a group.
            groupStart && (mine ? 'rounded-se-tight' : 'rounded-ss-tight'),
            m.pending && 'opacity-80'
          )}
        >
          <span className="sr-only">{mine ? t('You', 'أنت') : name}: </span>
          <p className={chatClasses.text}>{m.text}</p>
          <div className={cx(chatClasses.meta, mine ? 'text-on-primary/80' : 'text-fg-subtle')}>
            <time dateTime={m.createdAt.toISOString()}>{time}</time>
            {mine && (
              others.length === 0 || m.pending ? (
                <span role="img" aria-label={tick.label} title={tick.label}><Icon icon={tick.icon} size={14} /></span>
              ) : (
                <button type="button" className={chatClasses.ticks} aria-expanded={seenOpen} aria-label={tick.label} title={tick.label} onClick={onToggleSeen}>
                  <Icon icon={tick.icon} size={16} className={allSeen ? 'text-accent' : undefined} />
                </button>
              )
            )}
          </div>
        </div>
        {del}
      </div>
      {mine && seenOpen && (
        <p className={cx(chatClasses.seen, 'text-end')}>
          {seenBy.length > 0 && <>{t('Seen by: ', 'شاهدها: ')}<span className="user-text">{seenBy.map(nameOf).join(t(', ', '، '))}</span></>}
          {seenBy.length > 0 && notYet.length > 0 && ' · '}
          {notYet.length > 0 && <>{t('Not yet: ', 'لم يشاهدها بعد: ')}<span className="user-text">{notYet.map(nameOf).join(t(', ', '، '))}</span></>}
        </p>
      )}
    </li>
  );
}
