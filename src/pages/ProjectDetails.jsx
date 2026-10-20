import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Settings, Plus, ListChecks, CloudOff } from 'lucide-react';
import { Button } from '../components/Button.jsx';
import { Breadcrumb } from '../components/Breadcrumb.jsx';
import { EmptyState, Loading, SkeletonTaskRow } from '../components/States.jsx';
import { TaskRow, taskListClasses } from '../components/Task.jsx';
import { TaskFormModal } from '../components/TaskFormModal.jsx';
import { ConfirmDialog } from '../components/Overlay.jsx';
import { ProjectStatusView } from '../components/ProjectStatusView.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { usePrefs } from '../context/PreferencesContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useProject } from '../hooks/useProject.js';
import { useTasks } from '../hooks/useTasks.js';
import { createTask, updateTask, deleteTask } from '../services/tasks.js';
import { canEditTask, canDeleteTask, canChangeStatus } from '../lib/permissions.js';
import { todayISO } from '../lib/i18n.js';

export default function ProjectDetails() {
  const { id } = useParams();
  const { status, project, isOwner, reload } = useProject(id);
  if (status !== 'ready') return <ProjectStatusView status={status} onRetry={reload} />;
  return <ProjectView project={project} isOwner={isOwner} />;
}

// Split out so the tasks subscription only starts once we know the user is a member.
function ProjectView({ project, isOwner }) {
  const { t, lang } = usePrefs();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const tasks = useTasks(project.id);
  const [form, setForm] = useState({ open: false, task: null });
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Member names arrive with membership management (phase 5); until then only "you" is known.
  const members = project.memberIds.map((uid) => ({
    uid,
    name: uid === user.uid ? user.displayName || user.email : t('Member', 'عضو'),
  }));
  const nameOf = (uid) => members.find((m) => m.uid === uid)?.name ?? (uid ? t('Former member', 'عضو سابق') : null);
  const today = todayISO();

  const saveFailed = () =>
    showToast({
      tone: 'error',
      title: t('Couldn’t save the task', 'تعذّر حفظ المهمة'),
      message: t('Check your connection and try again. Nothing was saved.', 'تحقق من الاتصال وحاول مجددًا. لم يُحفظ شيء.'),
    });

  async function handleSubmit(values) {
    try {
      if (form.task) {
        await updateTask(project.id, form.task, values);
        showToast({ tone: 'success', title: t('Task updated', 'تم تحديث المهمة') });
      } else {
        await createTask(project.id, values, user.uid);
        showToast({ tone: 'success', title: t('Task created', 'تم إنشاء المهمة') });
      }
      setForm({ open: false, task: form.task });
    } catch (err) {
      saveFailed();
      throw err; // keeps the dialog open with the values
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteTask(project.id, toDelete.id);
      showToast({ tone: 'success', title: t('Task deleted', 'تم حذف المهمة') });
      setToDelete(null);
    } catch {
      showToast({ tone: 'error', title: t('Couldn’t delete the task', 'تعذّر حذف المهمة'), message: t('Check your connection and try again.', 'تحقق من الاتصال وحاول مجددًا.') });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-page flex-col gap-6 px-4 py-6 md:px-6 md:py-8 lg:px-8">
      <Breadcrumb items={[{ label: t('Dashboard', 'لوحة التحكم'), to: '/dashboard' }, { label: project.name }]} />
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 max-w-2xl">
          <h1 className="user-text break-words font-display text-title font-semibold text-fg">{project.name}</h1>
          {project.description && <p className="user-text mt-2 whitespace-pre-line break-words text-body text-fg-muted">{project.description}</p>}
        </div>
        <div className="flex shrink-0 gap-2">
          {isOwner && (
            <Button variant="secondary" icon={Settings} className="flex-1 md:flex-none" onClick={() => navigate(`/projects/${project.id}/settings`)}>
              {t('Settings', 'الإعدادات')}
            </Button>
          )}
          <Button icon={Plus} className="flex-1 md:flex-none" onClick={() => setForm({ open: true, task: null })}>
            {t('New task', 'مهمة جديدة')}
          </Button>
        </div>
      </header>

      {tasks.status === 'loading' ? (
        <Loading label={t('Loading tasks…', 'جارٍ تحميل المهام…')}>
          <ul className={taskListClasses}>{[0, 1, 2].map((i) => <SkeletonTaskRow key={i} />)}</ul>
        </Loading>
      ) : tasks.status === 'error' ? (
        <EmptyState icon={CloudOff} title={t('Couldn’t load the tasks', 'تعذّر تحميل المهام')}
          action={<Button variant="secondary" onClick={() => window.location.reload()}>{t('Reload', 'إعادة التحميل')}</Button>}>
          {t('Check your connection, or ask the owner if you still have access.', 'تحقق من الاتصال، أو اسأل المالك إن كنت لا تزال عضوًا.')}
        </EmptyState>
      ) : tasks.tasks.length === 0 ? (
        <EmptyState icon={ListChecks} title={t('No tasks yet', 'لا توجد مهام بعد')}
          action={<Button icon={Plus} onClick={() => setForm({ open: true, task: null })}>{t('New task', 'مهمة جديدة')}</Button>}>
          {t('Split the work into tasks with an owner and a due date.', 'قسّم العمل إلى مهام لكل منها مسؤول وموعد.')}
        </EmptyState>
      ) : (
        <ul className={taskListClasses} aria-label={t('Tasks', 'المهام')}>
          {tasks.tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={{ ...task, due: task.dueDate, assignee: nameOf(task.assigneeId) }}
              lang={lang}
              today={today}
              canEdit={canEditTask(task, project, user.uid)}
              canDelete={canDeleteTask(task, project, user.uid)}
              onEdit={() => setForm({ open: true, task })}
              onDelete={() => setToDelete(task)}
            />
          ))}
        </ul>
      )}

      <TaskFormModal
        open={form.open}
        task={form.task}
        members={members}
        canChangeStatus={form.task ? canChangeStatus(form.task, project, user.uid) : true}
        onSubmit={handleSubmit}
        onClose={() => setForm((f) => ({ ...f, open: false }))}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={t('Delete this task?', 'حذف هذه المهمة؟')}
        confirmLabel={deleting ? t('Deleting…', 'جارٍ الحذف…') : t('Delete task', 'حذف المهمة')}
        cancelLabel={t('Cancel', 'إلغاء')}
        closeLabel={t('Close', 'إغلاق')}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => !deleting && setToDelete(null)}
      >
        {toDelete && t(`“${toDelete.title}” will be removed for every member. This can’t be undone.`,
          `ستُحذف «${toDelete.title}» لدى كل الأعضاء. لا يمكن التراجع عن ذلك.`)}
      </ConfirmDialog>
    </main>
  );
}
