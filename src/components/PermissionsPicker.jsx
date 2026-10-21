import { useState } from 'react';
import { Eye, PencilLine, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { Modal } from './Overlay.jsx';
import { Button } from './Button.jsx';
import { Checkbox } from './Field.jsx';
import { Icon } from '../lib/icons.jsx';
import { cx } from '../lib/cx.js';
import { PERMS, PRESETS, presetOf } from '../lib/permissions.js';

/* Names and one-line explanations, in both languages (Arabic: Modern Standard Arabic). */
export const PERM_LABELS = {
  en: {
    create: ['Create tasks', 'Add new tasks to the project.'],
    edit: ['Edit any task', 'Title, description and priority, on every task.'],
    dueDate: ['Change due dates', 'Set or move the due date of any task.'],
    assign: ['Assign tasks', 'Give any task to a member, or take it back.'],
    status: ['Change any status', 'Update the status of tasks that aren’t theirs.'],
    delete: ['Delete any task', 'Remove tasks they didn’t create.'],
  },
  ar: {
    create: ['إنشاء المهام', 'إضافة مهام جديدة إلى المشروع.'],
    edit: ['تعديل أي مهمة', 'العنوان والوصف والأولوية في كل المهام.'],
    dueDate: ['تغيير تواريخ الاستحقاق', 'تحديد تاريخ استحقاق أي مهمة أو تغييره.'],
    assign: ['إسناد المهام', 'إسناد أي مهمة إلى عضو أو إلغاء إسنادها.'],
    status: ['تغيير حالة أي مهمة', 'تحديث حالة مهام غير مسندة إليه.'],
    delete: ['حذف أي مهمة', 'حذف مهام لم ينشئها.'],
  },
};

export const PRESET_LABELS = {
  en: {
    viewer: ['Viewer', 'Sees the project and updates the tasks assigned to them.'],
    contributor: ['Contributor', 'Creates tasks and manages the ones they created.'],
    manager: ['Task manager', 'Every permission, on every task.'],
    custom: ['Custom', 'Pick the permissions one by one.'],
  },
  ar: {
    viewer: ['مُطّلع', 'يرى المشروع ويحدّث حالة المهام المسندة إليه.'],
    contributor: ['مساهم', 'ينشئ المهام ويدير ما أنشأه منها.'],
    manager: ['مدير مهام', 'كل الصلاحيات على كل المهام.'],
    custom: ['مخصّص', 'اختر الصلاحيات واحدة واحدة.'],
  },
};
const PRESET_ICONS = { viewer: Eye, contributor: PencilLine, manager: ShieldCheck, custom: SlidersHorizontal };

/** Short label for a member's permissions: the template's name, or "Custom (3)". */
export function permsSummary(perms, lang) {
  const preset = presetOf(perms);
  const name = PRESET_LABELS[lang][preset][0];
  return preset === 'custom' ? `${name} (${perms.length})` : name;
}

export const permsPickerClasses = {
  presets: 'grid gap-2 sm:grid-cols-2',
  preset:
    'flex cursor-pointer items-start gap-2.5 rounded-leaf-sm border border-strong bg-field p-3 text-start transition-colors duration-fast ' +
    'hover:border-fg-muted has-checked:border-primary has-checked:bg-primary-soft has-disabled:cursor-not-allowed has-disabled:opacity-60 ' +
    'has-focus-visible:outline-2 has-focus-visible:outline-ring motion-reduce:transition-none',
  list: 'flex flex-col rounded-leaf-sm border border-subtle px-3 py-1',
  hint: 'block text-body-sm text-fg-muted',
};

/**
 * Templates (radio cards) + the six permissions (checkboxes). Picking a template fills the boxes;
 * "Custom" lets the owner tick them one by one. value: perms[]; onChange(perms).
 */
export function PermissionsPicker({ value, onChange, lang = 'en', disabled = false, name = 'perms-preset' }) {
  const t = (en, ar) => (lang === 'ar' ? ar : en);
  // "Custom" stays chosen even when the boxes happen to match a template.
  const [custom, setCustom] = useState(() => presetOf(value) === 'custom');
  const mode = custom ? 'custom' : presetOf(value);

  function choose(preset) {
    setCustom(preset === 'custom');
    if (preset !== 'custom') onChange([...PRESETS[preset]]);
  }
  function toggle(perm) {
    onChange(value.includes(perm) ? value.filter((p) => p !== perm) : PERMS.filter((p) => p === perm || value.includes(p)));
  }

  return (
    <div className="flex flex-col gap-3">
      <fieldset className="flex flex-col">
        <legend className="mb-2 text-label font-medium text-fg">{t('Permissions', 'الصلاحيات')}</legend>
        <div className={permsPickerClasses.presets}>
          {['viewer', 'contributor', 'manager', 'custom'].map((preset) => {
            const [label, hint] = PRESET_LABELS[lang][preset];
            return (
              <label key={preset} className={permsPickerClasses.preset}>
                <input type="radio" name={name} value={preset} checked={mode === preset} disabled={disabled}
                  onChange={() => choose(preset)} className="sr-only" />
                <Icon icon={PRESET_ICONS[preset]} size={18} className="mt-0.5 text-fg-primary" />
                <span>
                  <span className="block text-label font-medium text-fg">{label}</span>
                  <span className={permsPickerClasses.hint}>{hint}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <fieldset className={cx(permsPickerClasses.list)} disabled={disabled || mode !== 'custom'}>
        <legend className="sr-only">{t('Permissions in detail', 'تفاصيل الصلاحيات')}</legend>
        {PERMS.map((perm) => {
          const [label, hint] = PERM_LABELS[lang][perm];
          return (
            <Checkbox
              key={perm}
              checked={value.includes(perm)}
              disabled={disabled || mode !== 'custom'}
              onChange={() => toggle(perm)}
              label={<span><span className="text-fg">{label}</span> <span className="text-body-sm text-fg-muted">· {hint}</span></span>}
            />
          );
        })}
      </fieldset>
      <p className="text-body-sm text-fg-muted">
        {t('Everyone can always update the status of tasks assigned to them, and decline them.',
          'يستطيع الجميع دائمًا تحديث حالة المهام المسندة إليهم ورفضها.')}
      </p>
    </div>
  );
}

/** Edit one member's permissions. onSave(perms) should throw on failure; the dialog then stays open. */
export function PermissionsDialog({ member, perms, lang = 'en', onSave, onClose }) {
  const t = (en, ar) => (lang === 'ar' ? ar : en);
  return (
    <Modal open={Boolean(member)} onClose={onClose} closeLabel={t('Close', 'إغلاق')} className="max-w-lg"
      title={member ? t(`Permissions: ${member.name}`, `صلاحيات ${member.name}`) : ''}>
      {member && <PermissionsForm key={member.uid} initial={perms} lang={lang} onSave={onSave} onCancel={onClose} />}
    </Modal>
  );
}

function PermissionsForm({ initial, lang, onSave, onCancel }) {
  const t = (en, ar) => (lang === 'ar' ? ar : en);
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(value);
    } catch {
      setSaving(false); // the caller shows the error toast
    }
  }

  return (
    <form className="flex flex-col gap-4 text-start" onSubmit={handleSubmit}>
      <PermissionsPicker value={value} onChange={setValue} lang={lang} disabled={saving} name="perms-edit" />
      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={saving}>{t('Cancel', 'إلغاء')}</Button>
        <Button type="submit" loading={saving}>{saving ? t('Saving…', 'جارٍ الحفظ…') : t('Save permissions', 'حفظ الصلاحيات')}</Button>
      </div>
    </form>
  );
}
