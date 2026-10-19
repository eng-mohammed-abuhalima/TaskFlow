import { useNavigate, useParams } from 'react-router-dom';
import { Settings, ListChecks } from 'lucide-react';
import { Button } from '../components/Button.jsx';
import { Breadcrumb } from '../components/Breadcrumb.jsx';
import { EmptyState } from '../components/States.jsx';
import { ProjectStatusView } from '../components/ProjectStatusView.jsx';
import { usePrefs } from '../context/PreferencesContext.jsx';
import { useProject } from '../hooks/useProject.js';

// Shell for now: members, filters and tasks arrive in phases 4–6.
export default function ProjectDetails() {
  const { id } = useParams();
  const { t } = usePrefs();
  const navigate = useNavigate();
  const { status, project, isOwner, reload } = useProject(id);

  if (status !== 'ready') return <ProjectStatusView status={status} onRetry={reload} />;

  return (
    <main className="mx-auto flex max-w-page flex-col gap-6 px-4 py-6 md:px-6 md:py-8 lg:px-8">
      <Breadcrumb items={[{ label: t('Dashboard', 'لوحة التحكم'), to: '/dashboard' }, { label: project.name }]} />
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 max-w-2xl">
          <h1 className="user-text break-words font-display text-title font-semibold text-fg">{project.name}</h1>
          {project.description && <p className="user-text mt-2 whitespace-pre-line break-words text-body text-fg-muted">{project.description}</p>}
        </div>
        {isOwner && (
          <div className="flex shrink-0 gap-2">
            <Button variant="secondary" icon={Settings} className="flex-1 md:flex-none" onClick={() => navigate(`/projects/${id}/settings`)}>
              {t('Settings', 'الإعدادات')}
            </Button>
          </div>
        )}
      </header>
      <EmptyState icon={ListChecks} title={t('No tasks yet', 'لا توجد مهام بعد')}>
        {t('Tasks for this project will show up here.', 'ستظهر مهام هذا المشروع هنا.')}
      </EmptyState>
    </main>
  );
}
