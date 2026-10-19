import { FilterX } from 'lucide-react';
import { SearchField, Select } from './Field.jsx';
import { Button } from './Button.jsx';
import { statusOptions, priorityOptions } from './Badges.jsx';
import { Avatar } from './Avatar.jsx';

// #region classes
export const filterBarClasses = {
  root: 'flex flex-col gap-3 rounded-leaf border border-subtle bg-surface p-3 shadow-card lg:flex-row lg:items-end',
  selects: 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex lg:flex-none',
  select: 'lg:w-40',
  footer: 'flex items-center justify-between gap-3 lg:ms-auto lg:justify-end',
  count: 'text-body-sm tabular-nums text-fg-muted',
};
// #endregion

export function FilterBar({ lang = 'en', query = '', onQuery, status = 'all', onStatus, priority = 'all', onPriority, assignee = 'all', onAssignee, members = [], count, total, onClear }) {
  const t = (en, ar) => (lang === 'ar' ? ar : en);
  const all = { value: 'all', label: t('All', 'الكل') };
  const active = query || status !== 'all' || priority !== 'all' || assignee !== 'all';
  return (
    <div className={filterBarClasses.root} role="search">
      <SearchField
        className="lg:flex-1"
        label={t('Search tasks by title', 'ابحث في عناوين المهام')}
        placeholder={t('Search tasks…', 'ابحث في المهام…')}
        clearLabel={t('Clear search', 'مسح البحث')}
        value={query}
        onChange={(e) => onQuery && onQuery(e.target.value)}
        onClear={() => onQuery && onQuery('')}
      />
      <div className={filterBarClasses.selects}>
        <Select className={filterBarClasses.select} label={t('Status', 'الحالة')} value={status} onChange={(v) => onStatus && onStatus(v)}
          options={[all, ...statusOptions(lang)]} />
        <Select className={filterBarClasses.select} label={t('Priority', 'الأولوية')} value={priority} onChange={(v) => onPriority && onPriority(v)}
          options={[all, ...priorityOptions(lang)]} />
        <Select className={'col-span-2 sm:col-span-1 ' + filterBarClasses.select} label={t('Assignee', 'المسؤول')} value={assignee} onChange={(v) => onAssignee && onAssignee(v)}
          options={[all, { value: 'none', label: t('Unassigned', 'غير مُسندة') }, ...members.map((m) => ({ value: m, label: m, icon: <Avatar name={m} size="xs" /> }))]} />
      </div>
      <div className={filterBarClasses.footer}>
        <p className={filterBarClasses.count} aria-live="polite">
          {t(`${count} of ${total} tasks`, `${count} من ${total} مهمة`)}
        </p>
        <Button variant="ghost" icon={FilterX} disabled={!active} onClick={onClear}>{t('Clear', 'مسح')}</Button>
      </div>
    </div>
  );
}
