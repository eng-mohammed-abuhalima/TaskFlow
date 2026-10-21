import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Settings, Plus, ListChecks, CloudOff, SearchX, History } from 'lucide-react';
import { Button } from '../components/Button.jsx';
import { Breadcrumb } from '../components/Breadcrumb.jsx';
import { EmptyState, Loading, SkeletonTaskRow } from '../components/States.jsx';
import { TaskRow, taskListClasses } from '../components/Task.jsx';
import { TaskFormModal } from '../components/TaskFormModal.jsx';
import { StatusDialog } from '../components/StatusDialog.jsx';
import { FilterBar } from '../components/FilterBar.jsx';
import { ConfirmDialog } from '../components/Overlay.jsx';
import { ProjectStatusView } from '../components/ProjectStatusView.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { usePrefs } from '../context/PreferencesContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useProject } from '../hooks/useProject.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useTasks } from '../hooks/useTasks.js';
import { createTask, updateTask, deleteTask } from '../services/tasks.js';
import { canCreateTask, canEditTask, canDeleteTask, isProjectOwner, showsStatusButton, taskFieldAccess } from '../lib/permissions.js';
import { useMyPerms } from '../hooks/usePerms.js';
import { permsSummary } from '../components/PermissionsPicker.jsx';
import { projectMembers } from '../lib/members.js';
import { filterTasks, DEFAULT_FILTERS } from '../lib/filterTasks.js';
import { writeErrorMessage } from '../lib/network.js';
import { formatNumber, todayISO } from '../lib/i18n.js';
import { MemberChip } from '../components/Avatar.jsx';
import { Tabs, TabPanel } from '../components/Tabs.jsx';
import { ActivityFeed } from '../components/activity/ActivityFeed.jsx';

export default function ProjectDetails() {
  const { id } = useParams();
  const { status, project, isOwner, reload } = useProject(id);
  if (status !== 'ready') return <ProjectStatusView status={status} onRetry={reload} />;
  return <ProjectView project={project} isOwner={isOwner} />;
}

// Split out so the tasks subscription only starts once we know the user is a member.
function ProjectView({ project, isOwner }) {
  const { t, lang } = usePrefs();
  usePageTitle(project.name);
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const tasks = useTasks(project.id);
  // What this member was allowed to do (the owner: everything). The rules enforce the same.
  const perms = useMyPerms(project, user.uid);
  const mayCreate = canCreateTask(project, user.uid, perms);
  const [form, setForm] = useState({ open: false, task: null });
  const [toDelete, setToDelete] = useState(null);
  const [statusFor, setStatusFor] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  // Only the owner has the Activity tab (the rules let only the owner read the log).
  const [tab, setTab] = useState('tasks');
  const showing = isOwner ? tab : 'tasks';

  const members = projectMembers(project, t('Member', 'عضو'));
  const nameOf = (uid) => members.find((m) => m.uid === uid)?.name ?? (uid ? t('Former member', 'عضو سابق') : null);
  const today = todayISO();
  const visible = filterTasks(tasks.tasks, filters, today);
  const setFilter = (change) => setFilters((f) => ({ ...f, ...change }));
  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  const saveFailed = (err) =>
    showToast({ tone: 'error', title: t('Couldn’t save the task', 'تعذّر حفظ المهمة'), message: writeErrorMessage(err, t) });

  async function handleSubmit(values) {
    try {
      if (form.task) {
        // The owner can change the status here; the assignee (if someone else) is told, without a message.
        const statusChanged = values.status !== form.task.status;
        await updateTask(project, form.task, values, user.uid, statusChanged ? { recipients: [form.task.assigneeId].filter(Boolean) } : {});
        showToast({ tone: 'success', title: t('Task updated', 'تم تحديث المهمة') });
      } else {
        await createTask(project, values, user.uid);
        showToast({ tone: 'success', title: t('Task created', 'تم إنشاء المهمة') });
      }
      setForm({ open: false, task: form.task });
    } catch (err) {
      saveFailed(err);
      throw err; // keeps the dialog open with the values
    }
  }

  /** Status only, from StatusDialog: the other fields are sent unchanged. */
  async function handleStatus(status, update) {
    const task = statusFor;
    try {
      await updateTask(project, task, { ...task, status }, user.uid, update);
      showToast({ tone: 'success', title: t('Status updated', 'تم تحديث الحالة') });
      setStatusFor(null);
    } catch (err) {
      saveFailed(err);
      throw err; // keeps the dialog open with the values
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteTask(project, toDelete, user.uid);
      showToast({ tone: 'success', title: t('Task deleted', 'تم حذف المهمة') });
      setToDelete(null);
    } catch (err) {
      // The dialog stays open: pressing "Delete task" again is the retry.
      showToast({ tone: 'error', title: t('Couldn’t delete the task', 'تعذّر حذف المهمة'), message: writeErrorMessage(err, t, t('Check your connection and try again.', 'تحقق من الاتصال وحاول مجددًا.')) });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-page flex-col gap-6 px-4 py-6 md:px-6 md:py-8 lg:px-8">
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
          {mayCreate && (
            <Button icon={Plus} className="flex-1 md:flex-none" onClick={() => setForm({ open: true, task: null })}>
              {t('New task', 'مهمة جديدة')}
            </Button>
          )}
        </div>
      </header>

      <section aria-labelledby="members" className="flex flex-col gap-3 md:flex-row md:items-center">
        <h2 id="members" className="flex shrink-0 items-center gap-2 whitespace-nowrap text-label font-medium text-fg-muted">
          {t('Members', 'الأعضاء')} <span className="tabular-nums">· {formatNumber(members.length, lang)}</span>
        </h2>
        <ul className="flex flex-wrap gap-2">
          {members.map((m) => (
            <li key={m.uid}><MemberChip name={m.name} owner={m.uid === project.ownerId} ownerLabel={t('Owner', 'المالك')} /></li>
          ))}
        </ul>
        {!isOwner && (
          <p className="text-body-sm text-fg-muted md:ms-auto">
            {t('Your permissions: ', 'صلاحياتك: ')}<b className="font-medium text-fg">{permsSummary(perms, lang)}</b>
          </p>
        )}
      </section>

      {isOwner && (
        <Tabs
          idPrefix="project"
          label={t('Project views', 'عروض المشروع')}
          value={showing}
          onChange={setTab}
          tabs={[
            { id: 'tasks', label: t('Tasks', 'المهام'), icon: ListChecks },
            { id: 'activity', label: t('Activity', 'النشاط'), icon: History },
          ]}
        />
      )}

      {showing === 'activity' ? (
        <TabPanel idPrefix="project" value="activity">
          <ActivityFeed projectId={project.id} lang={lang} />
        </TabPanel>
      ) : (
      <TabPanel idPrefix="project" value="tasks" bare={!isOwner} className="flex flex-col gap-6">
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
          action={mayCreate ? <Button icon={Plus} onClick={() => setForm({ open: true, task: null })}>{t('New task', 'مهمة جديدة')}</Button> : null}>
          {t('Split the work into tasks with an owner and a due date.', 'قسّم العمل إلى مهام لكل منها مسؤول وموعد.')}
        </EmptyState>
      ) : (
        <>
          <FilterBar
            lang={lang}
            query={filters.q} onQuery={(q) => setFilter({ q })}
            status={filters.status} onStatus={(status) => setFilter({ status })}
            priority={filters.priority} onPriority={(priority) => setFilter({ priority })}
            assignee={filters.assignee} onAssignee={(assignee) => setFilter({ assignee })}
            overdue={filters.overdue} onOverdue={(overdue) => setFilter({ overdue })}
            members={members}
            count={formatNumber(visible.length, lang)}
            total={formatNumber(tasks.tasks.length, lang)}
            onClear={clearFilters}
          />
          {visible.length === 0 ? (
            <EmptyState icon={SearchX} title={t('No tasks match these filters', 'لا توجد مهام تطابق هذه المرشحات')}
              action={<Button variant="secondary" onClick={clearFilters}>{t('Clear filters', 'مسح المرشحات')}</Button>}>
              {t('Try a different keyword or clear a filter.', 'جرّب كلمة أخرى أو امسح أحد المرشحات.')}
            </EmptyState>
          ) : (
            <ul className={taskListClasses} aria-label={t('Tasks', 'المهام')}>
              {visible.map((task) => (
                <TaskRow
                  key={task.id}
                  task={{ ...task, due: task.dueDate, assignee: nameOf(task.assigneeId) }}
                  lang={lang}
                  today={today}
                  canEdit={canEditTask(task, project, user.uid, perms)}
                  canDelete={canDeleteTask(task, project, user.uid, perms)}
                  canChangeStatus={showsStatusButton(task, project, user.uid, perms)}
                  onChangeStatus={() => setStatusFor(task)}
                  onEdit={() => setForm({ open: true, task })}
                  onDelete={() => setToDelete(task)}
                />
              ))}
            </ul>
          )}
        </>
      )}
      </TabPanel>
      )}

      <TaskFormModal
        open={form.open}
        task={form.task}
        members={members}
        showStatus={isProjectOwner(project, user.uid)}
        access={form.task ? taskFieldAccess(form.task, project, user.uid, perms) : undefined}
        onSubmit={handleSubmit}
        onClose={() => setForm((f) => ({ ...f, open: false }))}
      />

      <StatusDialog
        task={statusFor}
        members={members}
        ownerId={project.ownerId}
        currentUid={user.uid}
        onSubmit={handleStatus}
        onClose={() => setStatusFor(null)}
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
    </div>
  );
}
