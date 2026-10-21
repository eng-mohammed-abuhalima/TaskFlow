import { useState } from 'react';
import { Modal } from './Overlay.jsx';
import { Button } from './Button.jsx';
import { TextField, Checkbox } from './Field.jsx';
import { STATUS_LABELS, statusIcon } from './Badges.jsx';
import { Icon } from '../lib/icons.jsx';
import { formatNumber } from '../lib/i18n.js';
import { usePrefs } from '../context/PreferencesContext.jsx';

export const STATUS_MESSAGE_MAX = 300; // keep in sync with validMessage() in firestore.rules
const STATUSES = ['todo', 'in_progress', 'done'];

export const statusDialogClasses = {
  options: 'grid gap-2 sm:grid-cols-3',
  option:
    'flex min-h-touch cursor-pointer items-center gap-2 rounded-leaf-sm border border-strong bg-field px-3 py-2 text-label font-medium text-fg ' +
    'transition-colors duration-fast hover:border-fg-muted has-checked:border-primary has-checked:bg-primary-soft has-checked:text-fg-primary ' +
    'has-focus-visible:outline-2 has-focus-visible:outline-ring motion-reduce:transition-none',
  current: 'ms-auto text-caption font-normal text-fg-subtle',
};

/**
 * Change a task's status with an optional message. The owner is always told when someone else
 * changes it (the rules require it); the sender can also pick other members to tell.
 * onSubmit(status, { message, recipients }) should throw on failure; the dialog then stays open.
 */
export function StatusDialog({ task, members, ownerId, currentUid, onSubmit, onClose }) {
  const { t } = usePrefs();
  return (
    <Modal open={Boolean(task)} onClose={onClose} closeLabel={t('Close', 'إغلاق')} title={t('Change status', 'تغيير الحالة')}>
      {/* Mounted only while open, keyed by task, so every opening starts fresh. */}
      {task && (
        <StatusForm key={task.id} task={task} members={members} ownerId={ownerId} currentUid={currentUid}
          onSubmit={onSubmit} onCancel={onClose} />
      )}
    </Modal>
  );
}

function StatusForm({ task, members, ownerId, currentUid, onSubmit, onCancel }) {
  const { t, lang } = usePrefs();
  const [status, setStatus] = useState(task.status);
  const [message, setMessage] = useState('');
  const isOwner = currentUid === ownerId;
  // The owner changing it tells the assignee by default; anyone else always tells the owner.
  const [recipients, setRecipients] = useState(() =>
    new Set(isOwner && task.assigneeId && task.assigneeId !== currentUid ? [task.assigneeId] : []));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const others = members.filter((m) => m.uid !== currentUid);

  const toggle = (uid) => setRecipients((current) => {
    const next = new Set(current);
    if (next.has(uid)) next.delete(uid);
    else next.add(uid);
    return next;
  });

  async function handleSubmit(e) {
    e.preventDefault();
    const found = {};
    if (status === task.status) found.status = t('Pick a different status.', 'اختر حالة مختلفة.');
    if (message.length > STATUS_MESSAGE_MAX) found.message = t(`Keep the message under ${STATUS_MESSAGE_MAX} characters.`, `يجب ألا تتجاوز الرسالة ${STATUS_MESSAGE_MAX} حرف.`);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    try {
      await onSubmit(status, { message, recipients: [...recipients] });
    } catch {
      setSaving(false); // the caller shows the error toast
    }
  }

  const counter = `${formatNumber(message.trim().length, lang)}/${formatNumber(STATUS_MESSAGE_MAX, lang)}`;
  return (
    <form className="flex flex-col gap-4 text-start" noValidate onSubmit={handleSubmit}>
      <p className="user-text break-words font-medium text-fg">{task.title}</p>

      <fieldset className="flex flex-col gap-2" aria-describedby={errors.status ? 'status-error' : undefined}>
        <legend className="mb-2 text-label font-medium text-fg">{t('New status', 'الحالة الجديدة')}</legend>
        <div className={statusDialogClasses.options}>
          {STATUSES.map((value) => {
            const s = statusIcon[value];
            return (
              <label key={value} className={statusDialogClasses.option}>
                <input type="radio" name="status" value={value} checked={status === value} disabled={saving}
                  onChange={() => setStatus(value)} className="sr-only" />
                <Icon icon={s.icon} size={16} className={s.className} />
                <span>{STATUS_LABELS[lang][value]}</span>
                {value === task.status && <span className={statusDialogClasses.current}>{t('current', 'الحالية')}</span>}
              </label>
            );
          })}
        </div>
        {errors.status && <p id="status-error" className="text-body-sm text-danger-fg">{errors.status}</p>}
      </fieldset>

      <TextField label={t('Message (optional)', 'رسالة (اختيارية)')} multiline rows={3} inputClassName="user-text"
        placeholder={t('e.g. Design is done, the API is next', 'مثال: انتهى التصميم، والربط مع الواجهة البرمجية هو التالي')}
        value={message} onChange={(e) => setMessage(e.target.value)} error={errors.message} disabled={saving} count={counter} />

      {others.length > 0 && (
        <fieldset className="flex flex-col">
          <legend className="mb-1 text-label font-medium text-fg">{t('Notify', 'إرسال إشعار إلى')}</legend>
          {others.map((m) => {
            const required = !isOwner && m.uid === ownerId;
            return (
              <Checkbox
                key={m.uid}
                label={required
                  ? <>{m.name} <span className="text-fg-muted">· {t('owner, always notified', 'المالك، يُبلَّغ دائمًا')}</span></>
                  : m.name}
                checked={required || recipients.has(m.uid)}
                disabled={saving || required}
                onChange={() => toggle(m.uid)}
              />
            );
          })}
        </fieldset>
      )}

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={saving}>{t('Cancel', 'إلغاء')}</Button>
        <Button type="submit" loading={saving}>{saving ? t('Saving…', 'جارٍ الحفظ…') : t('Change status', 'تغيير الحالة')}</Button>
      </div>
    </form>
  );
}
