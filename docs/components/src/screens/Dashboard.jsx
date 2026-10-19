import { Plus, FolderKanban, ListChecks, CircleCheck, TriangleAlert, FolderOpen, ChevronRight } from 'lucide-react';
import { Icon } from '../lib/icons.jsx';
import { formatNumber } from '../lib/i18n.js';
import { Navbar } from '../components/Navbar.jsx';
import { Button } from '../components/Button.jsx';
import { StatCard, ProjectCard } from '../components/Cards.jsx';
import { DueDate, PriorityBadge, STATUS_LABELS } from '../components/Badges.jsx';
import { Avatar } from '../components/Avatar.jsx';
import { EmptyState, SkeletonProjectCard, Skeleton, Loading } from '../components/States.jsx';
import { TODAY, projects, tasks, members } from '../demos/data.js';

function StatusBreakdown({ t, lang, counts }) {
  const total = counts.todo + counts.in_progress + counts.done;
  const rows = [
    ['todo', 'bg-status-todo', 'text-status-todo-fg'],
    ['in_progress', 'bg-status-progress', 'text-status-progress-fg'],
    ['done', 'bg-status-done', 'text-status-done-fg'],
  ];
  return (
    <section className="flex flex-col gap-4 rounded-leaf border border-subtle bg-surface p-card shadow-card" aria-labelledby="by-status">
      <div className="flex items-baseline justify-between">
        <h2 id="by-status" className="text-label font-medium text-fg-muted">{t('Tasks by status', 'المهام حسب الحالة')}</h2>
        <span className="text-body-sm tabular-nums text-fg-muted">{formatNumber(total, lang)} {t('total', 'إجمالي')}</span>
      </div>
      <div className="flex h-2.5 gap-1 overflow-hidden rounded-pill" aria-hidden="true">
        {rows.map(([k, bg]) => <span key={k} className={bg + ' h-full first:rounded-s-pill last:rounded-e-pill'} style={{ width: (counts[k] / total) * 100 + '%' }} />)}
      </div>
      <dl className="grid grid-cols-3 gap-2">
        {rows.map(([k, bg]) => (
          <div key={k} className="flex flex-col gap-1">
            <dt className="flex items-center gap-1.5 text-body-sm text-fg-muted"><span className={'size-2 rounded-pill ' + bg} aria-hidden="true" />{STATUS_LABELS[lang][k]}</dt>
            <dd className="text-heading font-semibold tabular-nums text-fg">{formatNumber(counts[k], lang)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function OverdueList({ t, lang }) {
  const extra = { id: 'x', title: t('Audit colour contrast in dark theme', 'تدقيق تباين الألوان في الوضع الداكن'), project: projects(lang)[2].name, status: 'todo', priority: 'medium', due: '2026-10-12', assignee: members(lang)[2] };
  const list = tasks(lang).filter((x) => x.due && x.due < TODAY && x.status !== 'done').map((x) => ({ ...x, project: projects(lang)[0].name })).concat(extra);
  return (
    <section className="flex flex-col rounded-leaf border border-subtle bg-surface shadow-card" aria-labelledby="overdue">
      <div className="flex items-center justify-between gap-3 border-b border-subtle px-card py-4">
        <h2 id="overdue" className="flex items-center gap-2 font-display text-heading font-semibold text-fg">
          <Icon icon={TriangleAlert} size={20} className="text-danger" />
          {t('Overdue', 'المتأخرة')}
        </h2>
        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-pill bg-danger-soft px-2 text-caption font-semibold tabular-nums text-danger-fg">{list.length}</span>
      </div>
      <ul className="[&>li+li]:border-t [&>li+li]:border-subtle">
        {list.map((x) => (
          <li key={x.id}>
            <a href="#" className="group flex items-center gap-3 px-card py-3 hover:bg-surface-hover focus-ring rounded-tight">
              <div className="min-w-0 flex-1">
                <p className="truncate text-body font-medium text-fg">{x.title}</p>
                <p className="truncate text-body-sm text-fg-muted">{x.project}</p>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-body-sm text-fg-muted">
                  <DueDate due={x.due} status={x.status} lang={lang} today={TODAY} />
                  <PriorityBadge priority={x.priority} lang={lang} />
                </p>
              </div>
              {x.assignee && <Avatar name={x.assignee} size="sm" />}
              <Icon icon={ChevronRight} mirror className="text-fg-subtle" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function DashboardScreen({ t, lang, theme, state, onTheme, onLang }) {
  const ps = projects(lang);
  const loading = state === 'loading';
  const empty = state === 'empty';
  return (
    <>
      <Navbar lang={lang} theme={theme} onTheme={onTheme} onLang={onLang} user={members(lang)[0]} onNewProject={() => {}} />
      <main className="mx-auto flex max-w-page flex-col gap-6 px-4 py-6 md:gap-8 md:px-6 md:py-8 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-body-sm text-fg-muted">{t('Monday, 19 October', 'الاثنين، 19 أكتوبر')}</p>
            <h1 className="mt-1 font-display text-title font-semibold text-fg">{t('Good morning, Sara', 'صباح الخير يا سارة')}</h1>
          </div>
          <Button icon={Plus} className="sm:hidden">{t('New project', 'مشروع جديد')}</Button>
        </div>

        {empty ? (
          <EmptyState icon={FolderOpen} title={t('Create your first project', 'أنشئ مشروعك الأول')} action={<Button icon={Plus}>{t('New project', 'مشروع جديد')}</Button>}>
            {t('A project holds your tasks and the teammates working on them.', 'يضم المشروع مهامك وزملاءك الذين يعملون عليها.')}
          </EmptyState>
        ) : loading ? (
          <Loading label={t('Loading dashboard…', 'جارٍ تحميل لوحة التحكم…')} className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="flex flex-col gap-3 rounded-leaf border border-subtle bg-surface p-card"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-8 w-1/3" /></div>)}</div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <SkeletonProjectCard key={i} />)}</div>
          </Loading>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
              <StatCard label={t('Projects', 'المشاريع')} value={4} icon={FolderKanban} lang={lang} />
              <StatCard label={t('Total tasks', 'إجمالي المهام')} value={52} icon={ListChecks} tone="todo" lang={lang} />
              <StatCard label={t('Done', 'مكتملة')} value={28} icon={CircleCheck} tone="done" hint={t('54% of all tasks', '54% من كل المهام')} lang={lang} />
              <StatCard label={t('Overdue', 'متأخرة')} value={3} icon={TriangleAlert} tone="danger" hint={t('Due before today', 'استُحقت قبل اليوم')} lang={lang} />
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
              <section className="flex min-w-0 flex-col gap-4" aria-labelledby="projects">
                <h2 id="projects" className="font-display text-heading font-semibold text-fg">{t('Your projects', 'مشاريعك')}</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{ps.map((p) => <ProjectCard key={p.id} {...p} lang={lang} />)}</div>
              </section>
              <div className="flex min-w-0 flex-col gap-4 md:grid md:grid-cols-2 lg:flex">
                <StatusBreakdown t={t} lang={lang} counts={{ todo: 15, in_progress: 9, done: 28 }} />
                <OverdueList t={t} lang={lang} />
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
export const DASHBOARD_STATES = [{ value: 'default', label: 'Data' }, { value: 'loading', label: 'Loading' }, { value: 'empty', label: 'Empty' }];
