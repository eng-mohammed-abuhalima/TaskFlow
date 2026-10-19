import { UserPlus, Trash2 } from 'lucide-react';
import { cx } from '../lib/cx.js';
import { TextField, Select, DateField } from './Field.jsx';
import { Avatar } from './Avatar.jsx';
import { Button } from './Button.jsx';
import { MemberChip } from './Avatar.jsx';
import { statusOptions, priorityOptions } from './Badges.jsx';

// #region panel
export const panelClasses = {
  root: 'rounded-leaf border border-subtle bg-surface shadow-card',
  header: 'flex flex-col gap-1 border-b border-subtle px-5 py-4',
  title: 'font-display text-heading font-semibold text-fg',
  desc: 'text-body-sm text-fg-muted',
  body: 'flex flex-col gap-4 p-5',
  danger: 'border-danger/50 bg-danger-soft/40',
  dangerHeader: 'border-danger/30',
};
// #endregion

export function Panel({ title, description, tone, children, className }) {
  return (
    <section className={cx(panelClasses.root, tone === 'danger' && panelClasses.danger, className)}>
      <div className={cx(panelClasses.header, tone === 'danger' && panelClasses.dangerHeader)}>
        <h2 className={cx(panelClasses.title, tone === 'danger' && 'text-danger-fg')}>{title}</h2>
        {description && <p className={panelClasses.desc}>{description}</p>}
      </div>
      <div className={panelClasses.body}>{children}</div>
    </section>
  );
}

export function MembersManager({ lang = 'en', owner, members = [], email = '', error, adding, onEmail, onAdd, onRemove }) {
  const t = (en, ar) => (lang === 'ar' ? ar : en);
  return (
    <Panel title={t('Members', 'الأعضاء')} description={t('Add teammates who already have a TaskFlow account.', 'أضف زملاء لديهم حساب في TaskFlow.')}>
      <form className="flex flex-col gap-3 sm:flex-row sm:items-start" onSubmit={(e) => { e.preventDefault(); onAdd && onAdd(); }} noValidate>
        <TextField className="flex-1" label={t('Email address', 'البريد الإلكتروني')} type="email" dir="ltr" placeholder="name@team.dev"
          value={email} onChange={(e) => onEmail && onEmail(e.target.value)} error={error} autoComplete="off" />
        <Button type="submit" icon={UserPlus} loading={adding} className="sm:mt-[calc(var(--text-label--line-height)+0.375rem)]">{t('Add member', 'إضافة عضو')}</Button>
      </form>
      <ul className="flex flex-wrap gap-2" aria-label={t('Current members', 'الأعضاء الحاليون')}>
        <li><MemberChip name={owner} owner ownerLabel={t('Owner', 'المالك')} /></li>
        {members.map((m) => (
          <li key={m}><MemberChip name={m} onRemove={() => onRemove && onRemove(m)} removeLabel={t('Remove ' + m, 'إزالة ' + m)} /></li>
        ))}
      </ul>
    </Panel>
  );
}

export function DangerZone({ lang = 'en', projectName, onDelete }) {
  const t = (en, ar) => (lang === 'ar' ? ar : en);
  return (
    <Panel tone="danger" title={t('Danger zone', 'منطقة الخطر')}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-label font-semibold text-fg">{t('Delete this project', 'حذف هذا المشروع')}</p>
          <p className="text-body-sm text-fg-muted">
            {t(`“${projectName}” and all of its tasks will be removed for every member. This can’t be undone.`, `سيُحذف «${projectName}» وجميع مهامه لدى كل الأعضاء. لا يمكن التراجع عن ذلك.`)}
          </p>
        </div>
        <Button variant="danger" icon={Trash2} onClick={onDelete}>{t('Delete project', 'حذف المشروع')}</Button>
      </div>
    </Panel>
  );
}

export function TaskForm({ lang = 'en', today, values = {}, errors = {}, members = [], saving, onCancel, onSubmit, title }) {
  const t = (en, ar) => (lang === 'ar' ? ar : en);
  const len = (values.title || '').length;
  return (
    <form className="@container flex flex-col gap-4" noValidate onSubmit={(e) => { e.preventDefault(); onSubmit && onSubmit(); }}>
      <TextField label={t('Title', 'العنوان')} required defaultValue={values.title} error={errors.title} maxLength={120}
        count={`${len}/120`} placeholder={t('e.g. Wire up the login form', 'مثال: ربط نموذج تسجيل الدخول')} />
      <TextField label={t('Description', 'الوصف')} multiline rows={3} defaultValue={values.description} hint={t('Optional · up to 1000 characters', 'اختياري · حتى 1000 حرف')} />
      <div className="grid gap-4 @sm:grid-cols-2">
        <Select label={t('Status', 'الحالة')} defaultValue={values.status || 'todo'} options={statusOptions(lang)} />
        <Select label={t('Priority', 'الأولوية')} defaultValue={values.priority || 'medium'} options={priorityOptions(lang)} />
        <DateField label={t('Due date', 'تاريخ الاستحقاق')} defaultValue={values.due || null} error={errors.due} lang={lang} today={today} />
        <Select label={t('Assignee', 'المسؤول')} defaultValue={values.assignee || 'none'}
          options={[{ value: 'none', label: t('Unassigned', 'غير مُسندة') }, ...members.map((m) => ({ value: m, label: m, icon: <Avatar name={m} size="xs" /> }))]} />
      </div>
      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel}>{t('Cancel', 'إلغاء')}</Button>
        <Button type="submit" loading={saving}>{saving ? t('Saving…', 'جارٍ الحفظ…') : (title || t('Create task', 'إنشاء المهمة'))}</Button>
      </div>
    </form>
  );
}
