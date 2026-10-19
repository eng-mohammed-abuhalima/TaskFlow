import { useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb.jsx';
import { ProjectForm } from '../components/ProjectForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { usePrefs } from '../context/PreferencesContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { createProject } from '../services/projects.js';

export default function NewProject() {
  const { t } = usePrefs();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(values) {
    try {
      const id = await createProject(values, user.uid);
      showToast({ tone: 'success', title: t('Project created', 'تم إنشاء المشروع') });
      navigate(`/projects/${id}`);
    } catch {
      showToast({
        tone: 'error',
        title: t('Couldn’t create the project', 'تعذّر إنشاء المشروع'),
        message: t('Check your connection and try again. Nothing was saved.', 'تحقق من الاتصال وحاول مجددًا. لم يُحفظ شيء.'),
      });
    }
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <Breadcrumb items={[{ label: t('Dashboard', 'لوحة التحكم'), to: '/dashboard' }, { label: t('New project', 'مشروع جديد') }]} />
      <div>
        <h1 className="font-display text-title font-semibold text-fg">{t('New project', 'مشروع جديد')}</h1>
        <p className="mt-2 text-body text-fg-muted">
          {t('You’ll be the owner. You can add teammates from the project settings.', 'ستكون مالك المشروع. يمكنك إضافة زملائك من إعدادات المشروع.')}
        </p>
      </div>
      <section className="rounded-leaf border border-subtle bg-surface p-card shadow-card">
        <ProjectForm
          submitLabel={t('Create project', 'إنشاء المشروع')}
          savingLabel={t('Creating…', 'جارٍ الإنشاء…')}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/dashboard')}
        />
      </section>
    </main>
  );
}
