import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, CloudOff } from 'lucide-react';
import { Button } from '../components/Button.jsx';
import { ProjectCard } from '../components/Cards.jsx';
import { EmptyState, Loading, SkeletonProjectCard } from '../components/States.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { usePrefs } from '../context/PreferencesContext.jsx';
import { listMyProjects } from '../services/projects.js';
import { timestampToISO } from '../lib/i18n.js';

// First version: the project list. Stats and the overdue list arrive in phase 6.
export default function Dashboard() {
  const { t, lang } = usePrefs();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState({ status: 'loading', projects: [] });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    listMyProjects(user.uid)
      .then((projects) => active && setState({ status: 'ready', projects }))
      .catch(() => active && setState({ status: 'error', projects: [] }));
    return () => { active = false; };
  }, [user.uid, attempt]);

  const retry = () => { setState({ status: 'loading', projects: [] }); setAttempt((n) => n + 1); };
  const newProject = (
    <Button icon={Plus} onClick={() => navigate('/projects/new')}>{t('New project', 'مشروع جديد')}</Button>
  );
  const firstName = user.displayName.split(' ')[0];

  return (
    <main className="mx-auto flex max-w-page flex-col gap-6 px-4 py-6 md:gap-8 md:px-6 md:py-8 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="font-display text-title font-semibold text-fg">
          {firstName ? t(`Welcome, ${firstName}`, `أهلًا ${firstName}`) : t('Dashboard', 'لوحة التحكم')}
        </h1>
        {/* The navbar holds this button from sm up. */}
        <div className="sm:hidden">{newProject}</div>
      </div>

      {state.status === 'loading' ? (
        <Loading label={t('Loading projects…', 'جارٍ تحميل المشاريع…')} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => <SkeletonProjectCard key={i} />)}
        </Loading>
      ) : state.status === 'error' ? (
        <EmptyState icon={CloudOff} title={t('Couldn’t load your projects', 'تعذّر تحميل مشاريعك')}
          action={<Button variant="secondary" onClick={retry}>{t('Retry', 'إعادة المحاولة')}</Button>}>
          {t('Check your connection and try again.', 'تحقق من الاتصال وحاول مجددًا.')}
        </EmptyState>
      ) : state.projects.length === 0 ? (
        <EmptyState icon={FolderOpen} title={t('Create your first project', 'أنشئ مشروعك الأول')} action={newProject}>
          {t('A project holds your tasks and the teammates working on them.', 'يضم المشروع مهامك وزملاءك الذين يعملون عليها.')}
        </EmptyState>
      ) : (
        <section className="flex min-w-0 flex-col gap-4" aria-labelledby="projects">
          <h2 id="projects" className="font-display text-heading font-semibold text-fg">{t('Your projects', 'مشاريعك')}</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {state.projects.map((p) => (
              <ProjectCard key={p.id} href={`/projects/${p.id}`} name={p.name} description={p.description}
                updated={timestampToISO(p.updatedAt)} lang={lang} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
