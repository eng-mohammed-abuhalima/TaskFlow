import { useEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext, DragOverlay, KeyboardSensor, MouseSensor, TouchSensor, closestCorners,
  defaultDropAnimationSideEffects, useDroppable, useSensor, useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { STATUS_LABELS, statusIcon } from '../Badges.jsx';
import { LiftedCard, SortableCard } from './BoardCard.jsx';
import { Icon } from '../../lib/icons.jsx';
import { cx } from '../../lib/cx.js';
import { formatNumber } from '../../lib/i18n.js';
import { BOARD_COLUMNS, groupByStatus, rankAt, unrankedFixes } from '../../lib/rank.js';
import { setRanks } from '../../services/tasks.js';

export const boardClasses = {
  // Columns side by side once the board is 48rem wide; below that they scroll sideways, one per screen.
  board:
    'flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2 [scrollbar-width:thin] ' +
    '@min-[48rem]:grid @min-[48rem]:grid-cols-3 @min-[48rem]:overflow-visible @min-[48rem]:pb-0',
  column:
    'flex w-[min(85%,20rem)] shrink-0 snap-start flex-col rounded-leaf border border-subtle bg-surface-sunken/60 ' +
    'transition-[background-color,border-color,box-shadow] duration-base ease-flow motion-reduce:transition-none @min-[48rem]:w-auto',
  columnOver: 'border-primary/50 bg-primary-soft/50 shadow-card',
  header: 'flex items-center gap-2 px-3 pt-3 pb-2',
  count: 'ms-auto inline-flex h-6 min-w-6 items-center justify-center rounded-pill bg-surface px-2 text-caption font-semibold tabular-nums text-fg-muted',
  list: 'flex min-h-28 flex-1 flex-col gap-2 p-2',
  empty: 'flex min-h-24 flex-1 items-center justify-center rounded-leaf-sm border border-dashed border-strong/50 p-4 text-center text-body-sm text-fg-subtle',
};

const dropAnimation = {
  duration: 220,
  easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }),
};

const isColumn = (id) => BOARD_COLUMNS.includes(id);
const stamp = (task) => task.updatedAt?.toMillis?.() ?? 0;

/**
 * Keyboard moves. Left / Right jump to the column beside (by where it is on screen, so it works the same in
 * RTL); Up / Down move inside the column (dnd-kit's sortable behaviour).
 */
function keyboardCoordinates(event, args) {
  const { collisionRect, droppableContainers } = args.context;
  if ((event.code === 'ArrowRight' || event.code === 'ArrowLeft') && collisionRect) {
    event.preventDefault();
    const rects = BOARD_COLUMNS.map((id) => droppableContainers.get(id)?.rect.current).filter(Boolean).sort((a, b) => a.left - b.left);
    const center = collisionRect.left + collisionRect.width / 2;
    const current = rects.findIndex((r) => center >= r.left && center <= r.right);
    const target = rects[current + (event.code === 'ArrowRight' ? 1 : -1)];
    if (current === -1 || !target) return undefined;
    return { x: target.left + (target.width - collisionRect.width) / 2, y: target.top };
  }
  return sortableKeyboardCoordinates(event, args);
}
const idsOf = (columns) => Object.fromEntries(BOARD_COLUMNS.map((s) => [s, columns[s].map((t) => t.id)]));

/**
 * Kanban board. Dragging between columns changes the status; dragging inside a column changes the shared
 * order (rank). The change shows at once (Firestore applies local writes immediately) and springs back if
 * the save fails. Mouse, touch (long press) and keyboard (Space, arrows, Space, Esc) all work; every card
 * also has a "Move to" menu, so nothing needs dragging.
 *
 * tasks: the filtered tasks to show; allTasks: every task (for the owner's one-time ordering of old tasks).
 * onMove(task, { status, rank }) saves a move and returns a promise.
 */
export default function TaskBoard({ projectId, tasks, allTasks, isOwner, canMove, canEdit, canDelete, nameOf, onMove, onEdit, onDelete, lang, t, today }) {
  // Moves sent but not yet in `tasks` (a frame or two), so a dropped card never flickers back. A move only
  // applies while the task is still the version it was made from: once any newer version arrives (ours,
  // or someone else's), the live data wins. A failed save removes it.
  const [pending, setPending] = useState({});
  const shown = useMemo(() => tasks.map((task) => {
    const move = pending[task.id];
    return move && stamp(task) === move.since ? { ...task, status: move.status, rank: move.rank } : task;
  }), [tasks, pending]);
  const columns = useMemo(() => groupByStatus(shown), [shown]);
  const byId = useMemo(() => Object.fromEntries(shown.map((task) => [task.id, task])), [shown]);

  // While dragging, the ids per column as the drag rearranges them; null otherwise.
  const [dragIds, setDragIds] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const ids = dragIds ?? idsOf(columns);
  const origin = useRef(null);

  // Tasks made before the board have no rank. The owner's board ranks them once (oldest first),
  // so every member sees the same order. Not shown, not logged; a failure just means it tries next time.
  const ranked = useRef(false);
  useEffect(() => {
    if (!isOwner || ranked.current) return;
    const all = groupByStatus(allTasks);
    const fixes = BOARD_COLUMNS.flatMap((s) => unrankedFixes(all[s]));
    if (fixes.length === 0) return;
    ranked.current = true;
    setRanks(projectId, fixes).catch(() => { ranked.current = false; });
  }, [isOwner, allTasks, projectId]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // Touch: press and hold, so a swipe still scrolls the page and the columns.
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: keyboardCoordinates })
  );

  const findColumn = (id, from = ids) => (isColumn(id) ? id : BOARD_COLUMNS.find((s) => from[s].includes(id)));
  const label = (status) => STATUS_LABELS[lang][status];
  // Where the card would land: over a card, that card's place; over a column, its end.
  const place = (active, over) => {
    const target = over ?? active;
    const status = findColumn(target.id);
    if (!status) return null;
    const list = ids[status];
    const count = list.includes(active.id) ? list.length : list.length + 1;
    const index = isColumn(target.id) ? count : list.indexOf(target.id) + 1;
    return { status, index, count };
  };

  function handleDragStart({ active, activatorEvent }) {
    const start = idsOf(columns);
    const status = findColumn(active.id, start);
    origin.current = { status, index: start[status].indexOf(active.id) };
    setDragIds(start);
    setActiveId(active.id);
    if (activatorEvent?.type?.startsWith('touch')) navigator.vibrate?.(12);
  }

  // Crossing into another column moves the id there now, so that column opens a gap under the pointer.
  function handleDragOver({ active, over }) {
    if (!over) return;
    const from = findColumn(active.id);
    const to = findColumn(over.id);
    if (!from || !to || from === to) return;
    setDragIds((current) => {
      const fromList = current[from].filter((id) => id !== active.id);
      const toList = [...current[to]];
      let index = isColumn(over.id) ? toList.length : toList.indexOf(over.id);
      const below = active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height / 2;
      if (!isColumn(over.id) && below) index += 1;
      toList.splice(Math.max(0, index), 0, active.id);
      return { ...current, [from]: fromList, [to]: toList };
    });
  }

  function handleDragEnd({ active, over }) {
    const start = origin.current;
    setActiveId(null);
    if (!over) { setDragIds(null); return; }
    const status = findColumn(active.id);
    let list = ids[status];
    const oldIndex = list.indexOf(active.id);
    const newIndex = isColumn(over.id) ? list.length - 1 : list.indexOf(over.id);
    if (newIndex >= 0 && oldIndex !== newIndex) list = arrayMove(list, oldIndex, newIndex);
    setDragIds(null);
    const index = list.indexOf(active.id);
    if (status === start.status && index === start.index) return; // dropped where it was
    move(byId[active.id], status, index, list);
  }

  /** Saves a move to `status` at `index` of `list` (the column's ids after the move). */
  function move(task, status, index, list = null) {
    const others = (list ?? ids[status]).filter((id) => id !== task.id).map((id) => byId[id]);
    const at = list ? index : index === 'start' ? 0 : others.length;
    const rank = rankAt(others, at);
    setPending((p) => ({ ...p, [task.id]: { status, rank, since: stamp(task) } }));
    onMove(task, { status, rank }).catch(() =>
      setPending((p) => { const next = { ...p }; delete next[task.id]; return next; })
    );
  }

  const moveTo = (task, status, where) => move(task, status, where);

  // Screen reader announcements, in the page language.
  const titleOf = (id) => byId[id]?.title ?? '';
  const where = (active, over) => {
    const p = place(active, over);
    return p ? t(`column ${label(p.status)}, position ${p.index} of ${p.count}`, `العمود ${label(p.status)}، الموضع ${formatNumber(p.index, lang)} من ${formatNumber(p.count, lang)}`) : '';
  };
  const accessibility = {
    screenReaderInstructions: {
      draggable: t(
        'To move a task, press Space. Use the arrow keys to move it between positions and columns, Space to drop it, or Escape to cancel. The actions menu on each task also has “Move to”.',
        'لنقل مهمة اضغط مسافة. استخدم الأسهم لتحريكها بين المواضع والأعمدة، ثم مسافة لإفلاتها، أو Escape للإلغاء. قائمة الإجراءات في كل مهمة فيها أيضًا «نقل إلى».'
      ),
    },
    announcements: {
      onDragStart: ({ active }) => t(`Picked up “${titleOf(active.id)}”, ${where(active)}.`, `حُملت «${titleOf(active.id)}»، ${where(active)}.`),
      onDragOver: ({ active, over }) => t(`“${titleOf(active.id)}” is now at ${where(active, over)}.`, `«${titleOf(active.id)}» الآن في ${where(active, over)}.`),
      onDragEnd: ({ active, over }) => t(`Dropped “${titleOf(active.id)}” at ${where(active, over)}.`, `أُفلتت «${titleOf(active.id)}» في ${where(active, over)}.`),
      onDragCancel: ({ active }) => t(`Move cancelled. “${titleOf(active.id)}” is back where it was.`, `أُلغي النقل. عادت «${titleOf(active.id)}» إلى مكانها.`),
    },
  };

  const cardProps = (task) => ({
    task,
    assignee: nameOf(task.assigneeId),
    canMove: canMove(task),
    canEdit: canEdit(task),
    canDelete: canDelete(task),
    lang, t, today,
    onMoveTo: moveTo, onEdit, onDelete,
  });
  const overColumn = activeId ? findColumn(activeId) : null;

  return (
    <div className="@container">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={() => { setDragIds(null); setActiveId(null); }}
        accessibility={accessibility}
      >
        <div className={boardClasses.board} role="group" aria-label={t('Task board', 'لوحة المهام')}>
          {BOARD_COLUMNS.map((status) => (
            <Column key={status} status={status} ids={ids[status]} highlighted={overColumn === status} label={label(status)} lang={lang} t={t}>
              {ids[status].map((id) => byId[id] && <SortableCard key={id} {...cardProps(byId[id])} />)}
            </Column>
          ))}
        </div>
        <DragOverlay dropAnimation={dropAnimation}>
          {activeId && byId[activeId] ? <LiftedCard {...cardProps(byId[activeId])} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function Column({ status, ids, highlighted, label, lang, t, children }) {
  const { setNodeRef } = useDroppable({ id: status });
  const headingId = `board-col-${status}`;
  return (
    <section aria-labelledby={headingId} className={cx(boardClasses.column, highlighted && boardClasses.columnOver)}>
      <header className={boardClasses.header}>
        <Icon icon={statusIcon[status].icon} size={16} className={statusIcon[status].className} />
        <h3 id={headingId} className="font-display text-label font-semibold text-fg">{label}</h3>
        <span className={boardClasses.count} aria-label={t(`${ids.length} tasks`, `${formatNumber(ids.length, lang)} مهام`)}>
          {formatNumber(ids.length, lang)}
        </span>
      </header>
      <SortableContext id={status} items={ids} strategy={verticalListSortingStrategy}>
        <ul ref={setNodeRef} className={boardClasses.list}>
          {children}
          {ids.length === 0 && (
            <li className={boardClasses.empty}>{t('Drop a task here', 'أفلت مهمة هنا')}</li>
          )}
        </ul>
      </SortableContext>
    </section>
  );
}
