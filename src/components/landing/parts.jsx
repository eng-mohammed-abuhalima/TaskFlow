import { Circle, CircleDashed, CircleCheck, TriangleAlert, CalendarDays } from 'lucide-react';
import { cx } from '../../lib/cx.js';

/** lucide icon, 1.5px stroke, decorative. `mirror` flips it in RTL (arrows). */
export function I({ icon: Glyph, size = 16, mirror = false, className, ...rest }) {
  return (
    <Glyph size={size} strokeWidth={1.5} aria-hidden="true" focusable="false"
      className={cx('i', mirror && 'mir', className)} {...rest} />
  );
}

export const STATUS_ICON = { todo: Circle, progress: CircleDashed, done: CircleCheck };

/** Status is never colour alone: icon + label. */
export function Pill({ status, label }) {
  return (
    <span className={`pill st-${status}`}>
      <I icon={STATUS_ICON[status]} size={14} />
      {label}
    </span>
  );
}

/** Priority: squared tag + signal bars (1/2/3 filled). */
export function PriTag({ pri, label }) {
  return (
    <span className={`ptag pr-${pri}`}>
      <svg className="bars" viewBox="0 0 12 12" aria-hidden="true">
        <rect className="b1" x="1" y="7" width="2.4" height="4" rx="0.8" />
        <rect className="b2" x="4.8" y="4.5" width="2.4" height="6.5" rx="0.8" />
        <rect className="b3" x="8.6" y="2" width="2.4" height="9" rx="0.8" />
      </svg>
      {label}
    </span>
  );
}

export function Av({ person, size, className }) {
  return <span className={cx('av', person.c, size, className)} aria-hidden="true">{person.i}</span>;
}

export function Due({ text, over }) {
  return (
    <span className={cx('due', over && 'over')}>
      <I icon={over ? TriangleAlert : CalendarDays} size={14} />
      <span className="num">{text}</span>
    </span>
  );
}

export function SectionHead({ eyebrow, title, sub, id, center = false }) {
  return (
    <div className={cx('shead rv', center && 'c')}>
      <span className="eyebrow"><span className="dot" aria-hidden="true" />{eyebrow}</span>
      <h2 id={id}>{title}</h2>
      {sub && <p>{sub}</p>}
    </div>
  );
}

/** Tasks with everything the mockups need (labels, person, overdue text). */
export function withPeople(t) {
  return t.tasks.map((x) => ({
    ...x,
    person: t.people[x.who],
    statusLabel: t.status[x.status],
    priLabel: t.pri[x.pri],
    dueText: x.over || x.due,
  }));
}
