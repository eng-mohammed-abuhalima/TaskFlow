import { useState } from 'react';
import { Modal } from '../Overlay.jsx';
import { Button } from '../Button.jsx';
import { TextField } from '../Field.jsx';
import { usePrefs } from '../../context/PreferencesContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { DeclineError, declineTask, leaveProject } from '../../services/notifications.js';
import { writeErrorMessage } from '../../lib/network.js';
import { formatNumber } from '../../lib/i18n.js';

export const REASON = { min: 3, max: 300 }; // keep in sync with validReason() in firestore.rules

/**
 * Asks for the reason, then declines: a task (it's unassigned and whoever assigned it is told why)
 * or a project (the user leaves it, their tasks there are unassigned and the owner is told why).
 */
export function DeclineDialog({ note, uid, onClose }) {
  const { t } = usePrefs();
  const isTask = note?.type === 'task_assigned';
  return (
    <Modal open={Boolean(note)} onClose={onClose} closeLabel={t('Close', 'إغلاق')}
      title={isTask ? t('Decline this task?', 'رفض هذه المهمة؟') : t('Decline and leave the project?', 'الاعتذار عن المشروع ومغادرته؟')}>
      {/* Mounted only while open, keyed by note, so every opening starts empty. */}
      {note && <DeclineForm key={note.id} note={note} uid={uid} isTask={isTask} onClose={onClose} />}
    </Modal>
  );
}

function DeclineForm({ note, uid, isTask, onClose }) {
  const { t, lang } = usePrefs();
  const { showToast } = useToast();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function validate() {
    const length = reason.trim().length;
    if (length < REASON.min) return t('Write a short reason (at least 3 characters).', 'اكتب سببًا موجزًا (3 أحرف على الأقل).');
    if (reason.length > REASON.max) return t(`Keep it under ${REASON.max} characters.`, `يجب ألا يتجاوز السبب ${REASON.max} حرف.`);
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const invalid = validate();
    setError(invalid);
    if (invalid) return;
    setSaving(true);
    try {
      if (isTask) await declineTask(note, reason, uid);
      else await leaveProject(note, reason, uid);
      showToast({
        tone: 'success',
        title: isTask ? t('Task declined', 'تم رفض المهمة') : t('You left the project', 'غادرت المشروع'),
        message: isTask ? t('We let them know why.', 'أُبلغ صاحب الإسناد بالسبب.') : t('The owner was told why.', 'أُبلغ المالك بالسبب.'),
      });
      onClose();
    } catch (err) {
      const stale = {
        'task-gone': t('This task no longer exists.', 'لم تعد هذه المهمة موجودة.'),
        'not-assigned': t('This task is no longer assigned to you.', 'لم تعد هذه المهمة مسندة إليك.'),
        'not-member': t('You are no longer a member of this project.', 'لم تعد عضوًا في هذا المشروع.'),
      };
      showToast({
        tone: 'error',
        title: t('Couldn’t decline', 'تعذّر الرفض'),
        message: err instanceof DeclineError ? stale[err.code] : writeErrorMessage(err, t),
      });
      setSaving(false);
      if (err instanceof DeclineError) onClose();
    }
  }

  const counter = `${formatNumber(reason.trim().length, lang)}/${formatNumber(REASON.max, lang)}`;
  return (
    <form className="flex flex-col gap-4 text-start" noValidate onSubmit={handleSubmit}>
      <p>
        {isTask
          ? t('The task will no longer be assigned to you, and the person who assigned it will see your reason.',
            'لن تبقى المهمة مسندة إليك، وسيرى من أسندها إليك سببك.')
          : t('You will leave the project and lose access to it. Tasks assigned to you there will be unassigned, and the owner will see your reason.',
            'ستغادر المشروع ولن تتمكن من الوصول إليه. سيُلغى إسناد مهامك فيه، وسيرى المالك سببك.')}
      </p>
      <TextField label={t('Reason', 'السبب')} required multiline rows={3} maxLength={REASON.max}
        value={reason} onChange={(e) => setReason(e.target.value)} error={error} disabled={saving} count={counter}
        placeholder={isTask ? t('e.g. I’m on leave until Sunday', 'مثال: أنا في إجازة حتى الأحد') : t('e.g. I’m not part of this team', 'مثال: لست ضمن هذا الفريق')} />
      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose} disabled={saving}>{t('Cancel', 'إلغاء')}</Button>
        <Button type="submit" variant="danger" loading={saving}>
          {saving ? t('Sending…', 'جارٍ الإرسال…') : isTask ? t('Decline task', 'رفض المهمة') : t('Leave project', 'مغادرة المشروع')}
        </Button>
      </div>
    </form>
  );
}
