import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, FolderKanban, ListChecks, CircleCheck, TriangleAlert, CloudOff } from 'lucide-react';
import { Button } from '../components/Button.jsx';
import { ProjectCard, StatCard } from '../components/Cards.jsx';
import { EmptyState, Loading, Skeleton, SkeletonProjectCard } from '../components/States.jsx';
import { StatusBreakdown } from '../components/dashboard/StatusBreakdown.jsx';
import { OverdueList } from '../components/dashboard/OverdueList.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { usePrefs } from '../context/PreferencesContext.jsx';
import { useDashboard } from '../hooks/useDashboard.js';
import { formatDate, formatNumber, timestampToISO, todayISO } from '../lib/i18n.js';
import { projectMembers } from '../lib/members.js';
import { projectProgress, summarizeDashboard } from '../lib/taskStats.js';

export default function Dashboard() {
  const { t, lang } = usePrefs();
  usePageTitle(t('Dashboard', 'لوحة التحكم'));
  const { user } = useAuth();
  const navigate = useNavigate();
  const { status, entries, reload } = useDashboard(user.uid);

  const today = todayISO();
  const firstName = user.displayName.split(' ')[0];
  const newProject = (
    <Button icon={Plus} onClick={() => navigate('/projects/new')}>{t('New project', 'مشروع جديد')}</Button>
  );

  return (
    <div className="mx-auto flex max-w-page flex-col gap-6 px-4 py-6 md:gap-8 md:px-6 md:py-8 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-body-sm text-fg-muted">{formatDate(today, lang, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h1 className="mt-1 font-display text-title font-semibold text-fg">
            {firstName ? t(`Welcome, ${firstName}`, `أهلًا ${firstName}`) : t('Dashboard', 'لوحة التحكم')}
          </h1>
        </div>
        {/* The navbar holds this button from sm up. */}
        <div className="sm:hidden">{newProject}</div>
      </div>

      {status === 'loading' ? (
        <Loading label={t('Loading dashboard…', 'جارٍ تحميل لوحة التحكم…')} className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-3 rounded-leaf border border-subtle bg-surface p-card"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-8 w-1/3" /></div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <SkeletonProjectCard key={i} />)}</div>
        </Loading>
      ) : status === 'error' ? (
        <EmptyState icon={CloudOff} title={t('Couldn’t load your dashboard', 'تعذّر تحميل لوحة التحكم')}
          action={<Button variant="secondary" onClick={reload}>{t('Retry', 'إعادة المحاولة')}</Button>}>
          {t('Check your connection and try again.', 'تحقق من الاتصال وحاول مجددًا.')}
        </EmptyState>
      ) : entries.length === 0 ? (
        <EmptyState icon={FolderOpen} title={t('Create your first project', 'أنشئ مشروعك الأول')} action={newProject}>
          {t('A project holds your tasks and the teammates working on them.', 'يضم المشروع مهامك وزملاءك الذين يعملون عليها.')}
        </EmptyState>
      ) : (
        <DashboardContent entries={entries} today={today} t={t} lang={lang} />
      )}
    </div>
  );
}

function DashboardContent({ entries, today, t, lang }) {
  const summary = summarizeDashboard(entries, today);
  const donePct = summary.total ? Math.round((summary.byStatus.done / summary.total) * 100) : 0;
  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <StatCard label={t('Projects', 'المشاريع')} value={summary.projects} icon={FolderKanban} lang={lang} />
        <StatCard label={t('Total tasks', 'إجمالي المهام')} value={summary.total} icon={ListChecks} tone="todo" lang={lang} />
        <StatCard label={t('Done', 'مكتملة')} value={summary.byStatus.done} icon={CircleCheck} tone="done" lang={lang}
          hint={summary.total ? t(`${formatNumber(donePct, lang)}% of all tasks`, `${formatNumber(donePct, lang)}% من كل المهام`) : undefined} />
        <StatCard label={t('Overdue', 'متأخرة')} value={summary.overdue.length} icon={TriangleAlert} tone="danger" lang={lang}
          hint={t('Due before today', 'استُحقت قبل اليوم')} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <section className="flex min-w-0 flex-col gap-4" aria-labelledby="projects">
          <h2 id="projects" className="font-display text-heading font-semibold text-fg">{t('Your projects', 'مشاريعك')}</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {entries.map(({ project, tasks }) => (
              <ProjectCard key={project.id} href={`/projects/${project.id}`} name={project.name} description={project.description}
                members={projectMembers(project, t('Member', 'عضو')).map((m) => m.name)}
                {...projectProgress(tasks, today)} updated={timestampToISO(project.updatedAt)} lang={lang} />
            ))}
          </div>
        </section>
        <div className="flex min-w-0 flex-col gap-4 md:grid md:grid-cols-2 lg:flex">
          <StatusBreakdown counts={summary.byStatus} />
          <OverdueList items={summary.overdue} today={today} />
        </div>
      </div>
    </>
  );
}
