import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb.jsx';
import { ProjectForm } from '../components/ProjectForm.jsx';
import { ProjectStatusView } from '../components/ProjectStatusView.jsx';
import { Panel, MembersManager, DangerZone } from '../components/Settings.jsx';
import { ConfirmDialog } from '../components/Overlay.jsx';
import { FullPageLoading } from '../components/routing/FullPageLoading.jsx';
import { usePrefs } from '../context/PreferencesContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useProject } from '../hooks/useProject.js';
import { updateProject, deleteProject } from '../services/projects.js';
import { addMemberByEmail, removeMember, MemberError, MAX_MEMBERS } from '../services/members.js';
import { projectMembers } from '../lib/members.js';
import { validateEmail } from '../lib/validation.js';

export default function ProjectSettings() {
  const { id } = useParams();
  const { t, lang } = usePrefs();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { status, project, isOwner, reload } = useProject(id);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [adding, setAdding] = useState(false);
  const [toRemove, setToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);

  // The project doc disappears the moment our own delete lands; don't flash a 404 before we leave.
  if (deleting && status !== 'ready') return <FullPageLoading />;
  if (status !== 'ready') return <ProjectStatusView status={status} onRetry={reload} />;
  // Members can read the project but settings are owner-only (the rules enforce it too).
  if (!isOwner) {
    return (
      <ProjectStatusView status="denied"
        deniedMessage={t('Only the project owner can change its settings.', 'يمكن لمالك المشروع فقط تغيير إعداداته.')} />
    );
  }

  const everyone = projectMembers(project, t('Member', 'عضو'));
  const owner = everyone.find((m) => m.uid === project.ownerId);
  const others = everyone.filter((m) => m.uid !== project.ownerId);

  const connectionToast = (title) =>
    showToast({ tone: 'error', title, message: t('Check your connection and try again. Nothing was saved.', 'تحقق من الاتصال وحاول مجددًا. لم يُحفظ شيء.') });

  async function handleSave(values) {
    try {
      await updateProject(id, values);
      showToast({ tone: 'success', title: t('Project updated', 'تم تحديث المشروع') });
      navigate(`/projects/${id}`);
    } catch {
      connectionToast(t('Couldn’t save your changes', 'تعذّر حفظ التغييرات'));
    }
  }

  async function handleAdd() {
    const invalid = validateEmail(email, t);
    setEmailError(invalid || '');
    if (invalid) return;
    setAdding(true);
    try {
      const added = await addMemberByEmail(project, email);
      setEmail('');
      showToast({ tone: 'success', title: t('Member added', 'تمت إضافة العضو'), message: added.displayName });
    } catch (err) {
      const messages = {
        'not-found': t('No account uses this email.', 'لا يوجد حساب بهذا البريد الإلكتروني.'),
        duplicate: t('This person is already a member.', 'هذا الشخص عضو بالفعل.'),
        full: t(`A project can have up to ${MAX_MEMBERS} members.`, `يمكن أن يضم المشروع حتى ${MAX_MEMBERS} عضوًا.`),
      };
      setEmailError(err instanceof MemberError ? messages[err.code] : t('Couldn’t add the member. Check your connection and try again.', 'تعذّرت إضافة العضو. تحقق من الاتصال وحاول مجددًا.'));
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove() {
    setRemoving(true);
    try {
      await removeMember(project, toRemove.uid);
      showToast({ tone: 'success', title: t('Member removed', 'تمت إزالة العضو'), message: toRemove.name });
      setToRemove(null);
    } catch {
      connectionToast(t('Couldn’t remove the member', 'تعذّرت إزالة العضو'));
    } finally {
      setRemoving(false);
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

      <MembersManager
        lang={lang}
        owner={owner.name}
        members={others}
        email={email}
        error={emailError}
        adding={adding}
        onEmail={(value) => { setEmail(value); setEmailError(''); }}
        onAdd={handleAdd}
        onRemove={setToRemove}
      />

      <DangerZone lang={lang} projectName={project.name} onDelete={() => setConfirming(true)} />

      <ConfirmDialog
        open={Boolean(toRemove)}
        title={toRemove ? t(`Remove ${toRemove.name}?`, `إزالة ${toRemove.name}؟`) : ''}
        confirmLabel={removing ? t('Removing…', 'جارٍ الإزالة…') : t('Remove member', 'إزالة العضو')}
        cancelLabel={t('Cancel', 'إلغاء')}
        closeLabel={t('Close', 'إغلاق')}
        loading={removing}
        onConfirm={handleRemove}
        onCancel={() => !removing && setToRemove(null)}
      >
        {t('They will lose access to this project right away, and the tasks assigned to them will become unassigned.',
          'سيفقد وصوله إلى هذا المشروع فورًا، وستصبح المهام المُسندة إليه غير مُسندة.')}
      </ConfirmDialog>

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
