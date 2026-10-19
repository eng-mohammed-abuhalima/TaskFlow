import { useState } from 'react';
import { Plus, Settings, ChevronRight, SearchX, ShieldX } from 'lucide-react';
import { Icon } from '../lib/icons.jsx';
import { Navbar } from '../components/Navbar.jsx';
import { Button } from '../components/Button.jsx';
import { AvatarStack, MemberChip } from '../components/Avatar.jsx';
import { FilterBar } from '../components/FilterBar.jsx';
import { TaskList } from '../components/Task.jsx';
import { Modal, Toast, toasterClasses } from '../components/Overlay.jsx';
import { TaskForm } from '../components/Settings.jsx';
import { EmptyState, SkeletonTaskRow, Loading, StatePage } from '../components/States.jsx';
import { TODAY, projects, tasks, members } from '../demos/data.js';

export function ProjectDetailsScreen({ t, lang, theme, state, onTheme, onLang }) {
  const p = projects(lang)[0];
  const all = tasks(lang);
  const [q, setQ] = useState('');
  const [s, setS] = useState('all');
  const [pr, setPr] = useState('all');
  const [a, setA] = useState('all');
  const noResults = state === 'empty';
  const shown = noResults ? [] : all.filter((x) =>
    (!q || x.title.toLowerCase().includes(q.toLowerCase())) && (s === 'all' || x.status === s) && (pr === 'all' || x.priority === pr) &&
    (a === 'all' || (a === 'none' ? !x.assignee : x.assignee === a)));
  const clear = () => { setQ(''); setS('all'); setPr('all'); setA('all'); };

  if (state === 'denied') {
    return (
      <>
        <Navbar lang={lang} theme={theme} onTheme={onTheme} onLang={onLang} user={members(lang)[0]} />
        <StatePage kind="denied" title={t('You don’t have access', 'ليست لديك صلاحية الوصول')} actionLabel={t('Back to dashboard', 'العودة إلى لوحة التحكم')}>
          {t('This project is private to its members. Ask the owner to add you.', 'هذا المشروع خاص بأعضائه. اطلب من المالك إضافتك.')}
        </StatePage>
      </>
    );
  }

  return (
    <div className="relative">
      <Navbar lang={lang} theme={theme} onTheme={onTheme} onLang={onLang} user={members(lang)[0]} current="project" />
      <main className="mx-auto flex max-w-page flex-col gap-6 px-4 py-6 md:px-6 md:py-8 lg:px-8">
        <nav aria-label={t('Breadcrumb', 'مسار التنقل')}>
          <ol className="flex items-center gap-1.5 text-body-sm text-fg-muted">
            <li><a href="#" className="rounded-tight hover:text-fg focus-ring">{t('Dashboard', 'لوحة التحكم')}</a></li>
            <li aria-hidden="true"><Icon icon={ChevronRight} size={14} mirror /></li>
            <li aria-current="page" className="truncate font-medium text-fg">{p.name}</li>
          </ol>
        </nav>
        <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 max-w-2xl">
            <h1 className="font-display text-title font-semibold text-fg">{p.name}</h1>
            <p className="mt-2 text-body text-fg-muted">{p.description}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="secondary" icon={Settings} className="flex-1 md:flex-none">{t('Settings', 'الإعدادات')}</Button>
            <Button icon={Plus} className="flex-1 md:flex-none">{t('New task', 'مهمة جديدة')}</Button>
          </div>
        </header>
        <section aria-labelledby="members" className="flex flex-col gap-3 md:flex-row md:items-center">
          <h2 id="members" className="flex shrink-0 items-center gap-2 whitespace-nowrap text-label font-medium text-fg-muted">
            {t('Members', 'الأعضاء')} <span className="tabular-nums">· {p.members.length}</span>
          </h2>
          <ul className="flex flex-wrap gap-2">
            <li><MemberChip name={p.members[0]} owner ownerLabel={t('Owner', 'المالك')} /></li>
            {p.members.slice(1).map((m) => <li key={m}><MemberChip name={m} /></li>)}
          </ul>
        </section>
        <FilterBar lang={lang} query={q} onQuery={setQ} status={s} onStatus={setS} priority={pr} onPriority={setPr} assignee={a} onAssignee={setA}
          members={members(lang)} count={shown.length} total={all.length} onClear={clear} />
        {state === 'loading' ? (
          <Loading label={t('Loading tasks…', 'جارٍ تحميل المهام…')}>
            <ul className="rounded-leaf border border-subtle bg-surface [&>li+li]:border-t [&>li+li]:border-subtle">{[0, 1, 2, 3].map((i) => <SkeletonTaskRow key={i} />)}</ul>
          </Loading>
        ) : shown.length ? (
          <TaskList tasks={shown} lang={lang} today={TODAY} label={t('Tasks', 'المهام')} />
        ) : (
          <EmptyState icon={SearchX} title={t('No tasks match these filters', 'لا توجد مهام تطابق هذه المرشحات')} action={<Button variant="secondary" onClick={clear}>{t('Clear filters', 'مسح المرشحات')}</Button>}>
            {t('Try a different keyword or clear a filter.', 'جرّب كلمة أخرى أو امسح أحد المرشحات.')}
          </EmptyState>
        )}
      </main>
      {state === 'form' && (
        <div className="absolute inset-0 z-50 flex items-start justify-center overflow-y-auto bg-scrim px-4 py-10">
          <Modal inline title={t('New task', 'مهمة جديدة')} closeLabel={t('Close', 'إغلاق')}>
            <TaskForm lang={lang} today={TODAY} members={members(lang)} values={{ title: 'Wi', status: 'todo', priority: 'high' }}
              errors={{ title: t('Title needs at least 3 characters', 'يجب أن يتكون العنوان من 3 أحرف على الأقل') }} />
          </Modal>
        </div>
      )}
      {state === 'toast' && (
        <div className={toasterClasses.replace('fixed', 'absolute')}>
          <Toast tone="error" title={t('Couldn’t save your changes', 'تعذّر حفظ التغييرات')} message={t('Check your connection and try again. Nothing was saved.', 'تحقق من الاتصال وحاول مجددًا. لم يُحفظ شيء.')}
            action={<Button size="sm" variant="secondary">{t('Retry', 'إعادة المحاولة')}</Button>} onClose={() => {}} closeLabel={t('Dismiss', 'إغلاق')} />
        </div>
      )}
    </div>
  );
}
export const PROJECT_STATES = [
  { value: 'default', label: 'Tasks' }, { value: 'form', label: 'Task form' }, { value: 'toast', label: 'Save failed' },
  { value: 'empty', label: 'No results' }, { value: 'loading', label: 'Loading' }, { value: 'denied', label: '403' },
];
