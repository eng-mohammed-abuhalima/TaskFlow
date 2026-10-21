import { useEffect, useId, useRef, useState } from 'react';
import { MessageCircle, SendHorizontal, X } from 'lucide-react';
import { AvatarStack } from '../Avatar.jsx';
import { Button } from '../Button.jsx';
import { ConfirmDialog } from '../Overlay.jsx';
import { EmptyState, Loading, Skeleton } from '../States.jsx';
import { MessageList } from './MessageList.jsx';
import { Icon } from '../../lib/icons.jsx';
import { cx } from '../../lib/cx.js';
import { formatNumber } from '../../lib/i18n.js';
import { writeErrorMessage } from '../../lib/network.js';
import { useToast } from '../../context/ToastContext.jsx';
import { MAX_MESSAGE, deleteMessage, sendMessage } from '../../services/chat.js';

export const projectChatClasses = {
  launcher:
    'fixed bottom-20 end-4 z-30 inline-flex size-14 items-center justify-center rounded-pill bg-primary text-on-primary ' +
    'shadow-modal inset-shadow-lip hover:bg-primary-hover focus-ring animate-chat-launcher md:bottom-auto md:top-[45%] md:end-6',
  ping: 'pointer-events-none absolute inset-0 rounded-pill bg-primary animate-chat-ping motion-reduce:hidden',
  badge:
    'pointer-events-none absolute -top-1 -end-1 inline-flex h-5 min-w-5 items-center justify-center rounded-pill ' +
    'bg-danger px-1 text-caption font-semibold tabular-nums text-on-danger ring-2 ring-surface',
  panel: 'flex h-full min-h-0 flex-col overflow-hidden border border-subtle bg-surface-raised text-fg shadow-pop',
  header: 'flex items-center gap-3 border-b border-subtle px-4 py-3',
  // Small screens: a full-height sheet on the end edge, over the page (native modal <dialog>).
  sheet:
    'fixed inset-0 m-0 ms-auto h-dvh max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-scrim ' +
    'open:animate-chat-in motion-reduce:open:animate-none sm:w-[26rem] sm:p-3',
  // xl and up: a column beside the task list that stays in view while the page scrolls.
  aside: 'sticky top-20 h-[calc(100dvh-6rem)] animate-chat-in motion-reduce:animate-none',
};

/** Floating, bobbing chat button that stays on screen. Shows the unread count and pulses when there is any. */
export function ChatLauncher({ unread, onOpen, t, lang }) {
  const label = unread
    ? t(`Project chat, ${unread} unread`, `دردشة المشروع، ${formatNumber(unread, lang)} غير مقروءة`)
    : t('Project chat', 'دردشة المشروع');
  return (
    <button type="button" className={projectChatClasses.launcher} onClick={onOpen} aria-label={label} title={t('Project chat', 'دردشة المشروع')}>
      {unread > 0 && <span className={projectChatClasses.ping} aria-hidden="true" />}
      <Icon icon={MessageCircle} size={26} mirror className="relative" />
      {unread > 0 && <span className={projectChatClasses.badge} aria-hidden="true">{unread > 9 ? '9+' : formatNumber(unread, lang)}</span>}
    </button>
  );
}

/**
 * The chat: on xl+ a sticky column next to the tasks (`wide`), below that a sheet over the page.
 * `chat` comes from useChat (owned by the page, so the launcher's unread count keeps updating while closed).
 */
export function ProjectChat({ open, wide, onClose, chat, project, uid, isOwner, members, t, lang }) {
  const panel = <ChatPanel {...{ chat, project, uid, isOwner, members, onClose, t, lang }} rounded={wide} />;
  if (wide) return open ? <aside className={projectChatClasses.aside} aria-label={t('Project chat', 'دردشة المشروع')}>{panel}</aside> : null;
  return <ChatSheet open={open} onClose={onClose}>{panel}</ChatSheet>;
}

function ChatSheet({ open, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      // showModal() focuses the first button (Close); start in the message box instead.
      d.querySelector('textarea')?.focus();
    }
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={projectChatClasses.sheet}
      onClose={onClose}
      onCancel={onClose}
      // A click on the dimmed backdrop (the dialog itself, outside the panel) closes it.
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {open && children}
    </dialog>
  );
}

function ChatPanel({ chat, project, uid, isOwner, members, onClose, rounded, t, lang }) {
  const { showToast } = useToast();
  const titleId = useId();
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const nameOf = (id) => members.find((m) => m.uid === id)?.name ?? t('Former member', 'عضو سابق');

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteMessage(project.id, toDelete.id);
      setToDelete(null);
    } catch (err) {
      showToast({ tone: 'error', title: t('Couldn’t delete the message', 'تعذّر حذف الرسالة'), message: writeErrorMessage(err, t, t('Check your connection and try again.', 'تحقق من الاتصال وحاول مجددًا.')) });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section aria-labelledby={titleId} className={cx(projectChatClasses.panel, rounded ? 'rounded-leaf' : 'sm:rounded-leaf')}>
      <header className={projectChatClasses.header}>
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-leaf-sm bg-primary-soft text-fg-primary">
          <Icon icon={MessageCircle} size={20} mirror />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="font-display text-subheading font-semibold text-fg">{t('Project chat', 'دردشة المشروع')}</h2>
          <p className="truncate text-caption text-fg-muted">
            {t(`${members.length} ${members.length === 1 ? 'member' : 'members'}`, `الأعضاء: ${formatNumber(members.length, lang)}`)}
          </p>
        </div>
        <AvatarStack names={members.map((m) => m.name)} max={3} size="sm" label={members.map((m) => m.name).join(t(', ', '، '))} />
        <Button variant="ghost" size="sm" iconOnly icon={X} aria-label={t('Close chat', 'إغلاق الدردشة')} onClick={onClose} className="-me-2" />
      </header>

      {chat.status === 'loading' ? (
        <Loading label={t('Loading messages…', 'جارٍ تحميل الرسائل…')} className="flex flex-1 flex-col justify-end gap-3 bg-canvas p-4">
          {['w-2/3', 'ms-auto w-1/2', 'w-3/5', 'ms-auto w-2/5'].map((w) => <Skeleton key={w} className={cx('h-10 rounded-card', w)} />)}
        </Loading>
      ) : chat.status === 'error' ? (
        <EmptyState className="m-4 flex-1 justify-center" title={t('Couldn’t load the chat', 'تعذّر تحميل الدردشة')}>
          {t('Check your connection, then reopen the chat.', 'تحقق من الاتصال، ثم أعد فتح الدردشة.')}
        </EmptyState>
      ) : (
        <MessageList
          chat={chat}
          uid={uid}
          ownerId={project.ownerId}
          isOwner={isOwner}
          memberIds={project.memberIds}
          nameOf={nameOf}
          onDelete={setToDelete}
          t={t}
          lang={lang}
        />
      )}

      <Composer project={project} uid={uid} disabled={chat.status !== 'ready'} t={t} lang={lang} />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={t('Delete this message?', 'حذف هذه الرسالة؟')}
        confirmLabel={deleting ? t('Deleting…', 'جارٍ الحذف…') : t('Delete message', 'حذف الرسالة')}
        cancelLabel={t('Cancel', 'إلغاء')}
        closeLabel={t('Close', 'إغلاق')}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => !deleting && setToDelete(null)}
      >
        {t('It will be removed for every member. This can’t be undone.', 'ستُحذف لدى كل الأعضاء. لا يمكن التراجع عن ذلك.')}
      </ConfirmDialog>
    </section>
  );
}

const SHOW_COUNT_FROM = 800;

/** Enter sends, Shift+Enter adds a line. The box grows with the text up to a few lines. */
function Composer({ project, uid, disabled, t, lang }) {
  const { showToast } = useToast();
  const [text, setText] = useState('');
  const ref = useRef(null);
  const length = text.trim().length;
  const tooLong = length > MAX_MESSAGE;
  const canSend = !disabled && length > 0 && !tooLong;

  useEffect(() => { ref.current?.focus({ preventScroll: true }); }, []);

  async function send(e) {
    e?.preventDefault();
    if (!canSend) return;
    const value = text;
    setText(''); // the message shows at once (as "sending"); the box is free for the next one
    ref.current?.focus();
    try {
      await sendMessage(project, uid, value);
    } catch (err) {
      setText((current) => current || value); // give the text back, unless they've already typed more
      showToast({ tone: 'error', title: t('Message not sent', 'لم تُرسل الرسالة'), message: writeErrorMessage(err, t) });
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) send(e);
  }

  return (
    <form onSubmit={send} className="flex items-end gap-2 border-t border-subtle bg-surface px-3 py-3">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <textarea
          ref={ref}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-label={t('Message', 'الرسالة')}
          aria-invalid={tooLong || undefined}
          placeholder={t('Write a message…', 'اكتب رسالة…')}
          className={cx(
            'user-text block max-h-32 min-h-touch w-full resize-none rounded-control border border-strong bg-field px-3 py-2 text-body-sm text-fg',
            'field-sizing-content placeholder:text-fg-subtle hover:border-fg-muted focus:border-primary focus-ring',
            'aria-invalid:border-danger disabled:cursor-not-allowed disabled:bg-surface-sunken md:min-h-control'
          )}
        />
        {length >= SHOW_COUNT_FROM && (
          <span className={cx('text-caption tabular-nums', tooLong ? 'font-medium text-danger-fg' : 'text-fg-subtle')} aria-live="polite">
            {formatNumber(length, lang)} / {formatNumber(MAX_MESSAGE, lang)}
          </span>
        )}
      </div>
      <Button type="submit" iconOnly icon={SendHorizontal} mirrorIcon disabled={!canSend} aria-label={t('Send', 'إرسال')} title={t('Send', 'إرسال')} />
    </form>
  );
}
