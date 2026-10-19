import { useState } from 'react';
import { TextField } from './Field.jsx';
import { Button } from './Button.jsx';
import { usePrefs } from '../context/PreferencesContext.jsx';
import { validateProjectName, validateDescription, compact, PROJECT_NAME, DESCRIPTION_MAX } from '../lib/validation.js';
import { formatNumber } from '../lib/i18n.js';

/**
 * Name + description form shared by "New project" and project settings.
 * onSubmit({ name, description }) should throw on failure; the form shows the error and stays filled.
 */
export function ProjectForm({ initial = { name: '', description: '' }, submitLabel, savingLabel, onSubmit, onCancel }) {
  const { t, lang } = usePrefs();
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const found = compact({ name: validateProjectName(name, t), description: validateDescription(description, t) });
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    try {
      await onSubmit({ name, description });
    } finally {
      setSaving(false);
    }
  }

  const counter = (value, max) => `${formatNumber(value.trim().length, lang)}/${formatNumber(max, lang)}`;
  return (
    <form className="flex flex-col gap-5" noValidate onSubmit={handleSubmit}>
      <TextField label={t('Project name', 'اسم المشروع')} required placeholder={t('e.g. Website Redesign', 'مثال: إعادة تصميم الموقع')}
        value={name} onChange={(e) => setName(e.target.value)} error={errors.name} disabled={saving} inputClassName="user-text"
        count={counter(name, PROJECT_NAME.max)} />
      <TextField label={t('Description', 'الوصف')} multiline rows={4}
        placeholder={t('What is this project about? (optional)', 'ما موضوع هذا المشروع؟ (اختياري)')}
        value={description} onChange={(e) => setDescription(e.target.value)} error={errors.description} disabled={saving} inputClassName="user-text"
        count={counter(description, DESCRIPTION_MAX)} />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel && <Button variant="secondary" onClick={onCancel} disabled={saving}>{t('Cancel', 'إلغاء')}</Button>}
        <Button type="submit" loading={saving}>{saving ? savingLabel : submitLabel}</Button>
      </div>
    </form>
  );
}
