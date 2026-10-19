import { useEffect, useRef, useId } from 'react';
import { X, TriangleAlert, CircleCheck, CircleAlert, Info } from 'lucide-react';
import { cx, variants } from '../lib/cx.js';
import { Icon } from '../lib/icons.jsx';
import { Button } from './Button.jsx';

// #region modal
export const modalClasses = {
  dialog:
    'm-auto w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-leaf border border-subtle bg-surface-raised p-0 text-fg shadow-modal ' +
    'backdrop:bg-scrim open:animate-modal-in motion-reduce:open:animate-none',
  inline: 'relative w-full max-w-md overflow-hidden rounded-leaf border border-subtle bg-surface-raised text-fg shadow-modal',
  header: 'flex items-start gap-3 px-5 pt-5',
  title: 'flex-1 font-display text-heading font-semibold text-fg',
  body: 'px-5 pt-2 pb-5 text-body text-fg-muted',
  footer: 'flex flex-col-reverse gap-2 border-t border-subtle bg-surface px-5 py-4 sm:flex-row sm:justify-end',
};
// #endregion

/**
 * Native <dialog> with showModal(): focus trap, Esc to close and inert background for free.
 * `inline` renders a static, non-modal copy for documentation.
 */
export function Modal({ open, onClose, title, children, footer, icon, closeLabel = 'Close', inline = false, className }) {
  const ref = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const d = ref.current;
    if (inline || !d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open, inline]);
  const content = (
    <>
      <div className={modalClasses.header}>
        {icon}
        <h2 id={titleId} className={modalClasses.title}>{title}</h2>
        <Button variant="ghost" size="sm" iconOnly icon={X} aria-label={closeLabel} onClick={onClose} className="-me-2 -mt-1" />
      </div>
      <div className={modalClasses.body}>{children}</div>
      {footer && <div className={modalClasses.footer}>{footer}</div>}
    </>
  );
  if (inline) return <div role="dialog" aria-labelledby={titleId} className={cx(modalClasses.inline, className)}>{content}</div>;
  return (
    <dialog ref={ref} aria-labelledby={titleId} onClose={onClose} onCancel={onClose} className={cx(modalClasses.dialog, className)}>
      {content}
    </dialog>
  );
}

export function ConfirmDialog({ title, children, confirmLabel, cancelLabel, onConfirm, onCancel, loading, tone = 'danger', ...modal }) {
  return (
    <Modal
      {...modal}
      title={title}
      onClose={onCancel}
      icon={
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-leaf-sm bg-danger-soft text-danger-fg">
          <Icon icon={TriangleAlert} size={20} />
        </span>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} autoFocus>{cancelLabel}</Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}

// #region toast
export const toastClasses = variants({
  base:
    'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-leaf border bg-surface-raised p-3 pe-2 shadow-pop ' +
    'motion-safe:animate-toast-in',
  variants: {
    tone: {
      success: 'border-subtle',
      error: 'border-danger/50',
      info: 'border-subtle',
    },
  },
  defaults: { tone: 'info' },
});
export const toastIcon = {
  success: { icon: CircleCheck, className: 'text-success' },
  error: { icon: CircleAlert, className: 'text-danger' },
  info: { icon: Info, className: 'text-info' },
};
export const toasterClasses = 'pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:end-4 sm:items-end';
// #endregion

export function Toast({ tone = 'info', title, message, action, onClose, closeLabel = 'Dismiss', className }) {
  const i = toastIcon[tone];
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={toastClasses({ tone, className })}>
      <Icon icon={i.icon} size={20} className={cx('mt-0.5', i.className)} />
      <div className="min-w-0 flex-1 py-0.5">
        <p className={cx('text-label font-semibold', tone === 'error' ? 'text-danger-fg' : 'text-fg')}>{title}</p>
        {message && <p className="mt-0.5 text-body-sm text-fg-muted">{message}</p>}
        {action && <div className="mt-2">{action}</div>}
      </div>
      {onClose && <Button variant="ghost" size="sm" iconOnly icon={X} aria-label={closeLabel} onClick={onClose} />}
    </div>
  );
}
