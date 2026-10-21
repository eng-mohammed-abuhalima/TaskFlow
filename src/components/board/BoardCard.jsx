import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as Popover from '@radix-ui/react-popover';
import { ArrowDownToLine, ArrowUpToLine, EllipsisVertical, GripVertical, Lock, Pencil, Trash2 } from 'lucide-react';
import { Avatar } from '../Avatar.jsx';
import { DueDate, PriorityBadge, STATUS_LABELS, statusIcon } from '../Badges.jsx';
import { Icon } from '../../lib/icons.jsx';
import { cx } from '../../lib/cx.js';
import { BOARD_COLUMNS } from '../../lib/rank.js';

export const boardCardClasses = {
  card:
    'group/card relative flex flex-col gap-2.5 rounded-leaf-sm border border-subtle bg-surface-raised p-3 text-fg shadow-card ' +
    'transition-[box-shadow,border-color] duration-fast ease-flow motion-reduce:transition-none',
  movable: 'cursor-grab touch-manipulation hover:border-strong hover:shadow-pop focus-ring active:cursor-grabbing',
  // The slot left behind while the card is dragged: a dashed outline the size of the card.
  slot: 'border-dashed border-primary/60 bg-primary-soft/40 shadow-none [&>*]:invisible',
  // The card under the pointer while dragging (DragOverlay): lifted and tilted.
  lifted: 'cursor-grabbing border-primary/40 shadow-modal rotate-2 scale-[1.03] motion-reduce:rotate-0 motion-reduce:scale-100',
  title: 'user-text line-clamp-3 break-words text-label font-medium text-fg',
  desc: 'user-text line-clamp-2 break-words text-body-sm text-fg-muted',
  menu:
    'z-50 flex w-56 flex-col overflow-hidden rounded-leaf-sm border border-subtle bg-surface-raised py-1 text-fg shadow-pop ' +
    'data-[state=open]:animate-pop-in motion-reduce:animate-none',
  item:
    'flex h-10 w-full items-center gap-2.5 px-3 text-start text-body-sm text-fg hover:bg-surface-hover focus-visible:bg-surface-hover ' +
    'focus-visible:outline-none disabled:pointer-events-none disabled:text-fg-subtle',
  danger: 'text-danger-fg hover:bg-danger-soft focus-visible:bg-danger-soft',
  sep: 'my-1 border-t border-subtle',
  heading: 'px-3 pb-1 pt-2 text-caption font-medium text-fg-subtle',
};

// Clicks and keys on the menu button must not start a drag of the card around it.
const keepOutOfDrag = { onPointerDown: (e) => e.stopPropagation(), onKeyDown: (e) => e.stopPropagation() };

/** One card on the board, sortable when `canMove`. The whole card is the drag handle. */
export function SortableCard(props) {
  const { task, canMove } = props;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: !canMove,
    data: { status: task.status },
  });
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), transition }} className="list-none">
      <CardBody {...props} slot={isDragging} handleProps={canMove ? { ...attributes, ...listeners } : null} />
    </li>
  );
}

/** The lifted copy that follows the pointer (rendered in DragOverlay). */
export const LiftedCard = (props) => <CardBody {...props} lifted />;

function CardBody({ task, assignee, canMove, canEdit, canDelete, lang, t, today, onMoveTo, onEdit, onDelete, slot, lifted, handleProps }) {
  return (
    <article
      {...handleProps}
      aria-roledescription={handleProps ? t('movable task', 'مهمة قابلة للنقل') : undefined}
      aria-label={task.title}
      className={cx(boardCardClasses.card, canMove && boardCardClasses.movable, slot && boardCardClasses.slot, lifted && boardCardClasses.lifted)}
    >
      <div className="flex items-start gap-1.5">
        {canMove ? (
          <Icon icon={GripVertical} size={16} className="mt-0.5 -ms-1 text-fg-subtle opacity-60 group-hover/card:opacity-100" />
        ) : (
          <span title={t('Only the owner, the assignee, or members allowed to change status can move this task.', 'ينقل هذه المهمة المالك أو المسؤول عنها أو من لديه صلاحية تغيير الحالة فقط.')}>
            <Icon icon={Lock} size={14} className="mt-1 text-fg-subtle" />
          </span>
        )}
        <p className={cx(boardCardClasses.title, 'flex-1', task.status === 'done' && 'text-fg-muted')}>{task.title}</p>
        {!lifted && (
          <CardMenu task={task} canMove={canMove} canEdit={canEdit} canDelete={canDelete} lang={lang} t={t}
            onMoveTo={onMoveTo} onEdit={onEdit} onDelete={onDelete} />
        )}
      </div>
      {task.description && <p className={boardCardClasses.desc}>{task.description}</p>}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <PriorityBadge priority={task.priority} lang={lang} />
        {task.dueDate && <DueDate due={task.dueDate} status={task.status} lang={lang} today={today} />}
        {assignee && (
          <span className="ms-auto inline-flex min-w-0 items-center gap-1.5 text-caption text-fg-muted">
            <Avatar name={assignee} size="xs" />
            <span className="user-text truncate">{assignee}</span>
          </span>
        )}
      </div>
    </article>
  );
}

/** The one-click alternative to dragging (WCAG 2.5.7), plus edit and delete. */
function CardMenu({ task, canMove, canEdit, canDelete, lang, t, onMoveTo, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  if (!canMove && !canEdit && !canDelete) return null;
  const run = (fn) => () => { setOpen(false); fn(); };
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        {...keepOutOfDrag}
        aria-label={t(`Actions for “${task.title}”`, `إجراءات «${task.title}»`)}
        className="-me-1.5 -mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-pill text-fg-subtle hover:bg-surface-hover hover:text-fg focus-ring touch-target"
      >
        <Icon icon={EllipsisVertical} size={16} />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="end" sideOffset={4} collisionPadding={12} className={boardCardClasses.menu} {...keepOutOfDrag}>
          {canMove && (
            <>
              <p className={boardCardClasses.heading}>{t('Move to', 'نقل إلى')}</p>
              {BOARD_COLUMNS.map((status) => (
                <button key={status} type="button" className={boardCardClasses.item} disabled={status === task.status}
                  onClick={run(() => onMoveTo(task, status, 'end'))}>
                  <Icon icon={statusIcon[status].icon} size={16} className={statusIcon[status].className} />
                  {STATUS_LABELS[lang][status]}
                  {status === task.status && <span className="ms-auto text-caption">{t('Current', 'الحالية')}</span>}
                </button>
              ))}
              <div className={boardCardClasses.sep} />
              <button type="button" className={boardCardClasses.item} onClick={run(() => onMoveTo(task, task.status, 'start'))}>
                <Icon icon={ArrowUpToLine} size={16} /> {t('Move to top', 'نقل إلى الأعلى')}
              </button>
              <button type="button" className={boardCardClasses.item} onClick={run(() => onMoveTo(task, task.status, 'end'))}>
                <Icon icon={ArrowDownToLine} size={16} /> {t('Move to bottom', 'نقل إلى الأسفل')}
              </button>
            </>
          )}
          {(canEdit || canDelete) && canMove && <div className={boardCardClasses.sep} />}
          {canEdit && (
            <button type="button" className={boardCardClasses.item} onClick={run(() => onEdit(task))}>
              <Icon icon={Pencil} size={16} /> {t('Edit task', 'تعديل المهمة')}
            </button>
          )}
          {canDelete && (
            <button type="button" className={cx(boardCardClasses.item, boardCardClasses.danger)} onClick={run(() => onDelete(task))}>
              <Icon icon={Trash2} size={16} /> {t('Delete task', 'حذف المهمة')}
            </button>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
