import { useState } from 'react';
import { Modal } from './Overlay.jsx';
import { Button } from './Button.jsx';
import { TextField, Select, DateField } from './Field.jsx';
import { Avatar } from './Avatar.jsx';
import { statusOptions, priorityOptions } from './Badges.jsx';
import { usePrefs } from '../context/PreferencesContext.jsx';
import { formatNumber, todayISO } from '../lib/i18n.js';
import { validateTaskTitle, validateDescription, compact, TASK_TITLE, DESCRIPTION_MAX } from '../lib/validation.js';

const NONE = 'none'; // Radix Select can't use an empty string as a value

/**
 * Create / edit task dialog. `task` = null means create. Only the owner and the task's creator open it.
 * `showStatus`: the owner also changes the status here (edit only). The assignee uses StatusDialog
 * (status + optional message) from the task row instead.
 * members: [{ uid, name }].
 * onSubmit(values) should throw on failure; the dialog then stays open with the values kept.
 */
export function TaskFormModal({ open, task, members, showStatus = false, onSubmit, onClose }) {
  const { t } = usePrefs();
  const editing = Boolean(task);
  return (
    <Modal open={open} onClose={onClose} title={editing ? t('Edit task', 'تعديل المهمة') : t('New task', 'مهمة جديدة')}
      closeLabel={t('Close', 'إغلاق')} className="max-w-lg">
      {/* Mounted only while open, keyed by task, so every opening starts from fresh values. */}
      {open && (
        <TaskForm key={task?.id ?? 'new'} task={task} members={members} showStatus={showStatus} onSubmit={onSubmit} onCancel={onClose} />
      )}
    </Modal>
  );
}

function TaskForm({ task, members, showStatus, onSubmit, onCancel }) {
  const { t, lang } = usePrefs();
  const editing = Boolean(task);
  const [values, setValues] = useState({
    title: task?.title ?? '',
    description: task?.description ?? '',
    status: task?.status ?? 'todo',
    priority: task?.priority ?? 'medium',
    assigneeId: task?.assigneeId ?? NONE,
    dueDate: task?.dueDate ?? null,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (key) => (value) => setValues((v) => ({ ...v, [key]: value }));

  // An assignee who was removed from the project still shows, so the field never looks empty.
  const assigneeOptions = [
    { value: NONE, label: t('Unassigned', 'غير مُسندة') },
    ...members.map((m) => ({ value: m.uid, label: m.name, icon: <Avatar name={m.name} size="xs" /> })),
  ];
  if (values.assigneeId !== NONE && !members.some((m) => m.uid === values.assigneeId)) {
    assigneeOptions.push({ value: values.assigneeId, label: t('Former member', 'عضو سابق'), disabled: true });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const found = compact({ title: validateTaskTitle(values.title, t), description: validateDescription(values.description, t) });
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    try {
      await onSubmit({ ...values, assigneeId: values.assigneeId === NONE ? null : values.assigneeId });
    } catch {
      setSaving(false); // the caller shows the error toast
    }
  }

  const counter = (value, max) => `${formatNumber(value.trim().length, lang)}/${formatNumber(max, lang)}`;
  return (
    <form className="@container flex flex-col gap-4 text-start" noValidate onSubmit={handleSubmit}>
      <TextField label={t('Title', 'العنوان')} required autoFocus inputClassName="user-text"
        placeholder={t('e.g. Wire up the login form', 'مثال: ربط نموذج تسجيل الدخول')}
        value={values.title} onChange={(e) => set('title')(e.target.value)} error={errors.title} disabled={saving}
        count={counter(values.title, TASK_TITLE.max)} />
      <TextField label={t('Description', 'الوصف')} multiline rows={3} inputClassName="user-text"
        value={values.description} onChange={(e) => set('description')(e.target.value)} error={errors.description} disabled={saving}
        count={counter(values.description, DESCRIPTION_MAX)} />
      <div className="grid gap-4 @sm:grid-cols-2">
        {editing && showStatus && (
          <Select label={t('Status', 'الحالة')} options={statusOptions(lang)} value={values.status} onChange={set('status')} disabled={saving} />
        )}
        <Select label={t('Priority', 'الأولوية')} options={priorityOptions(lang)} value={values.priority} onChange={set('priority')} disabled={saving} />
        <DateField label={t('Due date', 'تاريخ الاستحقاق')} lang={lang} today={todayISO()} value={values.dueDate} onChange={set('dueDate')} />
        <Select label={t('Assignee', 'المسؤول')} options={assigneeOptions} value={values.assigneeId} onChange={set('assigneeId')} disabled={saving} />
      </div>
      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={saving}>{t('Cancel', 'إلغاء')}</Button>
        <Button type="submit" loading={saving}>
          {saving ? t('Saving…', 'جارٍ الحفظ…') : editing ? t('Save changes', 'حفظ التغييرات') : t('Create task', 'إنشاء المهمة')}
        </Button>
      </div>
    </form>
  );
}
