import { STATUS_LABELS } from '../Badges.jsx';
import { formatDate, tr } from '../../lib/i18n.js';
import { permsSummary } from '../PermissionsPicker.jsx';

/*
  Turns stored activity entries and notifications (facts: type, names, ids) into sentences in the
  reader's language. Arabic copy is Modern Standard Arabic. Names and titles are wrapped in <bdi> so an
  English title inside an Arabic sentence (or the reverse) keeps its own direction and punctuation.
*/

const Name = ({ children }) => <bdi className="font-semibold text-fg">{children}</bdi>;
const Title = ({ children, lang }) => (
  <>{lang === 'ar' ? '«' : '“'}<bdi className="font-medium text-fg">{children}</bdi>{lang === 'ar' ? '»' : '”'}</>
);

/** A permission set by its template name (Viewer, Contributor…) or “Custom (n)”. */
const Perms = ({ perms, lang }) => <b className="font-medium text-fg">{permsSummary(perms ?? [], lang)}</b>;

const FIELD_LABELS = {
  en: { title: 'title', description: 'description', priority: 'priority', dueDate: 'due date', name: 'name' },
  ar: { title: 'العنوان', description: 'الوصف', priority: 'الأولوية', dueDate: 'تاريخ الاستحقاق', name: 'الاسم' },
};
const fieldList = (fields, lang) =>
  new Intl.ListFormat(lang === 'ar' ? 'ar' : 'en', { type: 'conjunction' }).format((fields || []).map((f) => FIELD_LABELS[lang][f] ?? f));

/** One activity entry (owner's log) as a sentence. */
export function ActivitySentence({ entry, lang }) {
  const t = tr(lang);
  const A = <Name>{entry.actorName}</Name>;
  const B = <Name>{entry.targetName || t('a former member', 'عضو سابق')}</Name>;
  const T = <Title lang={lang}>{entry.taskTitle}</Title>;
  const status = (s) => STATUS_LABELS[lang][s] ?? s;

  switch (entry.type) {
    case 'task_created':
      return entry.targetId
        ? t(<>{A} created {T} and assigned it to {B}</>, <>أنشأ {A} المهمة {T} وأسندها إلى {B}</>)
        : t(<>{A} created {T}</>, <>أنشأ {A} المهمة {T}</>);
    case 'task_updated':
      return t(<>{A} edited {T} ({fieldList(entry.fields, lang)})</>, <>عدّل {A} المهمة {T} ({fieldList(entry.fields, lang)})</>);
    case 'task_status':
      return t(
        <>{A} moved {T} from <b className="font-medium text-fg">{status(entry.from)}</b> to <b className="font-medium text-fg">{status(entry.to)}</b></>,
        <>غيّر {A} حالة المهمة {T} من <b className="font-medium text-fg">{status(entry.from)}</b> إلى <b className="font-medium text-fg">{status(entry.to)}</b></>
      );
    case 'task_assigned':
      return t(<>{A} assigned {T} to {B}</>, <>أسند {A} المهمة {T} إلى {B}</>);
    case 'task_unassigned':
      return t(<>{A} unassigned {B} from {T}</>, <>ألغى {A} إسناد المهمة {T} إلى {B}</>);
    case 'task_deleted':
      return t(<>{A} deleted {T}</>, <>حذف {A} المهمة {T}</>);
    case 'task_declined':
      return t(<>{A} declined {T}</>, <>رفض {A} المهمة {T}</>);
    case 'member_added':
      return entry.perms
        ? t(<>{A} added {B} to the project as <Perms perms={entry.perms} lang={lang} /></>, <>أضاف {A} {B} إلى المشروع بصلاحيات <Perms perms={entry.perms} lang={lang} /></>)
        : t(<>{A} added {B} to the project</>, <>أضاف {A} {B} إلى المشروع</>);
    case 'member_perms':
      return t(<>{A} changed the permissions of {B} to <Perms perms={entry.perms} lang={lang} /></>, <>غيّر {A} صلاحيات {B} إلى <Perms perms={entry.perms} lang={lang} /></>);
    case 'member_removed':
      return t(<>{A} removed {B} from the project</>, <>أزال {A} {B} من المشروع</>);
    case 'member_left':
      return t(<>{A} declined the invitation and left the project</>, <>اعتذر {A} عن المشروع وغادره</>);
    case 'project_updated':
      return t(<>{A} edited the project ({fieldList(entry.fields, lang)})</>, <>عدّل {A} المشروع ({fieldList(entry.fields, lang)})</>);
    default:
      return t(<>{A} made a change</>, <>أجرى {A} تغييرًا</>);
  }
}

/** One notification, from the recipient's point of view. */
export function NotificationSentence({ note, lang }) {
  const t = tr(lang);
  const A = <Name>{note.actorName}</Name>;
  const T = <Title lang={lang}>{note.taskTitle}</Title>;
  const P = <Title lang={lang}>{note.projectName}</Title>;

  switch (note.type) {
    case 'task_assigned':
      return t(<>{A} assigned you {T} in {P}</>, <>أسند إليك {A} المهمة {T} في مشروع {P}</>);
    case 'task_due_changed':
      return note.dueDate
        ? t(<>{A} moved the due date of {T} to <b className="font-medium text-fg">{formatDate(note.dueDate, lang, { day: 'numeric', month: 'long' })}</b></>,
          <>غيّر {A} تاريخ استحقاق المهمة {T} إلى <b className="font-medium text-fg">{formatDate(note.dueDate, lang, { day: 'numeric', month: 'long' })}</b></>)
        : t(<>{A} removed the due date of {T}</>, <>أزال {A} تاريخ استحقاق المهمة {T}</>);
    case 'task_deleted':
      return t(<>{A} deleted {T}, which was assigned to you</>, <>حذف {A} المهمة {T} المسندة إليك</>);
    case 'task_status':
      return t(
        <>{A} moved {T} in {P} to <b className="font-medium text-fg">{STATUS_LABELS.en[note.status] ?? note.status}</b></>,
        <>غيّر {A} حالة المهمة {T} في مشروع {P} إلى <b className="font-medium text-fg">{STATUS_LABELS.ar[note.status] ?? note.status}</b></>
      );
    // Older notifications, from before status updates replaced them.
    case 'task_done':
      return t(<>{A} completed {T} in {P}</>, <>أنجز {A} المهمة {T} في مشروع {P}</>);
    case 'task_declined':
      return t(<>{A} declined {T} in {P}</>, <>رفض {A} المهمة {T} في مشروع {P}</>);
    case 'member_added':
      return note.perms
        ? t(<>{A} added you to {P} as <Perms perms={note.perms} lang={lang} /></>, <>أضافك {A} إلى مشروع {P} بصلاحيات <Perms perms={note.perms} lang={lang} /></>)
        : t(<>{A} added you to {P}</>, <>أضافك {A} إلى مشروع {P}</>);
    case 'perms_changed':
      return t(<>{A} changed your permissions in {P} to <Perms perms={note.perms} lang={lang} /></>, <>غيّر {A} صلاحياتك في مشروع {P} إلى <Perms perms={note.perms} lang={lang} /></>);
    case 'member_left':
      return t(<>{A} declined and left {P}</>, <>اعتذر {A} عن مشروع {P} وغادره</>);
    default:
      return t(<>{A} made a change in {P}</>, <>أجرى {A} تغييرًا في مشروع {P}</>);
  }
}

/** "Reason: …" under a decline, or "Message: …" under a status update, in the reader's language. */
export function Reason({ text, lang, kind = 'reason' }) {
  const label = kind === 'message' ? (lang === 'ar' ? 'الرسالة: ' : 'Message: ') : (lang === 'ar' ? 'السبب: ' : 'Reason: ');
  return (
    <p className="mt-1.5 rounded-tight border-s-2 border-subtle bg-surface-sunken px-2.5 py-1.5 text-body-sm text-fg-muted">
      <span className="font-medium text-fg">{label}</span>
      <span className="user-text whitespace-pre-line break-words">{text}</span>
    </p>
  );
}
