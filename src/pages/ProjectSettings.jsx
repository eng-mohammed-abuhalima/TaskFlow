import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb.jsx';
import { ProjectForm } from '../components/ProjectForm.jsx';
import { ProjectStatusView } from '../components/ProjectStatusView.jsx';
import { Panel, DangerZone } from '../components/Settings.jsx';
import { ConfirmDialog } from '../components/Overlay.jsx';
import { usePrefs } from '../context/PreferencesContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useProject } from '../hooks/useProject.js';
import { updateProject, deleteProject } from '../services/projects.js';

export default function ProjectSettings() {
  const { id } = useParams();
  const { t, lang } = usePrefs();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { status, project, isOwner, reload } = useProject(id);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Members can read the project but settings are owner-only (the rules enforce it too).
  if (status !== 'ready') return <ProjectStatusView status={status} onRetry={reload} />;
  if (!isOwner) {
    return (
      <ProjectStatusView status="denied"
        deniedMessage={t('Only the project owner can change its settings.', 'يمكن لمالك المشروع فقط تغيير إعداداته.')} />
    );
  }

  const saveFailed = () =>
    showToast({
      tone: 'error',
      title: t('Couldn’t save your changes', 'تعذّر حفظ التغييرات'),
      message: t('Check your connection and try again. Nothing was saved.', 'تحقق من الاتصال وحاول مجددًا. لم يُحفظ شيء.'),
    });

  async function handleSave(values) {
    try {
      await updateProject(id, values);
      showToast({ tone: 'success', title: t('Project updated', 'تم تحديث المشروع') });
      navigate(`/projects/${id}`);
    } catch {
      saveFailed();
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteProject(id);
      showToast({ tone: 'success', title: t('Project deleted', 'تم حذف المشروع'), message: project.name });
      navigate('/dashboard', { replace: true });
    } catch {
      setDeleting(false);
      setConfirming(false);
      showToast({
        tone: 'error',
        title: t('Couldn’t delete the project', 'تعذّر حذف المشروع'),
        message: t('Check your connection and try again.', 'تحقق من الاتصال وحاول مجددًا.'),
      });
    }
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <Breadcrumb items={[
        { label: t('Dashboard', 'لوحة التحكم'), to: '/dashboard' },
        { label: project.name, to: `/projects/${id}` },
        { label: t('Settings', 'الإعدادات') },
      ]} />
      <h1 className="font-display text-title font-semibold text-fg">{t('Project settings', 'إعدادات المشروع')}</h1>

      <Panel title={t('Details', 'التفاصيل')} description={t('Name and description are visible to every member.', 'الاسم والوصف يظهران لكل الأعضاء.')}>
        <ProjectForm
          initial={{ name: project.name, description: project.description }}
          submitLabel={t('Save changes', 'حفظ التغييرات')}
          savingLabel={t('Saving…', 'جارٍ الحفظ…')}
          onSubmit={handleSave}
          onCancel={() => navigate(`/projects/${id}`)}
        />
      </Panel>

      {/* Members management arrives in phase 5. */}

      <DangerZone lang={lang} projectName={project.name} onDelete={() => setConfirming(true)} />

      <ConfirmDialog
        open={confirming}
        title={t('Delete this project?', 'حذف هذا المشروع؟')}
        confirmLabel={deleting ? t('Deleting…', 'جارٍ الحذف…') : t('Delete project', 'حذف المشروع')}
        cancelLabel={t('Cancel', 'إلغاء')}
        closeLabel={t('Close', 'إغلاق')}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => !deleting && setConfirming(false)}
      >
        {t(`“${project.name}” and all of its tasks will be removed for every member. This can’t be undone.`,
          `سيُحذف «${project.name}» وجميع مهامه لدى كل الأعضاء. لا يمكن التراجع عن ذلك.`)}
      </ConfirmDialog>
    </main>
  );
}
