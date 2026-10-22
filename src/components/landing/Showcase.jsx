import { useRef, useState } from 'react';
import { FolderPlus, UserPlus, CircleCheck, LayoutDashboard, SquareKanban, MessageSquare, List, TriangleAlert, Keyboard, CheckCheck, Send } from 'lucide-react';
import { Logo } from '../Navbar.jsx';
import { I, PriTag, Av, Due, SectionHead, STATUS_ICON, withPeople } from './parts.jsx';

export function HowItWorks({ t }) {
  const h = t.how;
  const steps = [[FolderPlus, h.s1, h.s1b], [UserPlus, h.s2, h.s2b], [CircleCheck, h.s3, h.s3b]];
  return (
    <section className="sec band" id="how" aria-labelledby="how-title">
      <div className="wrap">
        <SectionHead center id="how-title" eyebrow={h.eyebrow} title={h.title} sub={h.sub} />
        <ol className="steps">
          {steps.map(([icon, title, body], i) => (
            <li key={i} className={i === 2 ? 'step last rv' : 'step rv'}>
              <span className="badge leaf"><I icon={icon} size={24} /><span className="n num" aria-hidden="true">{i + 1}</span></span>
              <div><h3>{title}</h3><p>{body}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function DashPanel({ t }) {
  const d = t.dash;
  const stats = [
    [List, d.s1, 48], [STATUS_ICON.progress, d.s2, 12, 'var(--status-progress)'], [STATUS_ICON.done, d.s3, 29, 'var(--status-done)'],
  ];
  return (
    <div className="panel">
      <div className="dash-h"><div><div className="g">{d.greet}</div><div className="s">{d.sub}</div></div></div>
      <div className="stats">
        {stats.map(([icon, label, v, color]) => (
          <div key={label} className="scard leaf"><span className="k"><I icon={icon} style={color && { color }} />{label}</span><span className="v num">{v}</span></div>
        ))}
        <div className="scard leaf warn"><span className="k"><I icon={TriangleAlert} />{d.s4}</span><span className="v num">3</span></div>
      </div>
      <div className="drow">
        <div className="box leaf">
          <div className="box-h"><span>{d.overTitle}</span><span className="cnt num">3</span></div>
          <div className="olist">
            {d.over.map((o) => (
              <div key={o.title} className="orow">
                <span className={`av ${o.c}`} aria-hidden="true">{o.ini}</span>
                <div className="tt"><b>{o.title}</b><span>{o.project}</span></div>
                <Due text={o.late} over />
              </div>
            ))}
          </div>
        </div>
        <div className="box leaf">
          <div className="box-h"><span>{d.breakTitle}</span><span className="cnt num">48</span></div>
          <div className="bigbar" aria-hidden="true"><i className="s1" style={{ width: '14.6%' }} /><i className="s2" style={{ width: '25%' }} /><i className="s3" style={{ width: '60.4%' }} /></div>
          <div className="blegend">
            {[['todo', 1, '7 · 15%'], ['progress', 2, '12 · 25%'], ['done', 3, '29 · 60%']].map(([s, n, v]) => (
              <div key={s} className={`t${n}`}><I icon={STATUS_ICON[s]} />{t.status[s]}<span className="c num">{v}</span></div>
            ))}
          </div>
        </div>
        <div className="box leaf">
          <div className="box-h"><span>{d.projTitle}</span><span className="cnt num">3</span></div>
          {d.projects.map((p) => (
            <div key={p.name} className="prow">
              <div className="top"><span>{p.name}</span><span className="num">{p.pct}%</span></div>
              <div className="track"><i style={{ width: `${p.pct}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BoardPanel({ t }) {
  const tasks = withPeople(t);
  return (
    <div className="panel">
      <div className="board">
        {['todo', 'progress', 'done'].map((k) => {
          const items = tasks.filter((x) => x.status === k);
          return (
            <div key={k} className="bcol">
              <div className={`bcol-h ${k}`}><I icon={STATUS_ICON[k]} />{t.status[k]}<span className="ct num">{items.length}</span></div>
              {items.map((task) => (
                <div key={task.title} className={task.over ? 'kcard over leaf' : 'kcard leaf'}>
                  <span className="tt">{task.title}</span>
                  <div className="meta">
                    <PriTag pri={task.pri} label={task.priLabel} />
                    <Due text={task.dueText} over={!!task.over} />
                    <Av person={task.person} /><span className="sr">{task.person.n}</span>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <p className="hint"><I icon={Keyboard} />{t.tour.boardHint}</p>
    </div>
  );
}

function Msg({ p, time, text }) {
  return (
    <div className="cm"><Av person={p} size="lg" /><div className="bb"><span className="who"><b>{p.n}</b><span className="num">{time}</span></span><span className="tx">{text}</span></div></div>
  );
}

function ChatPanel({ t }) {
  const c = t.chat;
  const P = t.people;
  return (
    <div className="chat">
      <div className="chat-side">
        {c.projects.map((p) => (
          <div key={p.name} className={p.on ? 'p on' : 'p'}>
            <I icon={MessageSquare} size={14} /><span>{p.name}</span>
            {p.unread > 0 && <><span className="unread num" aria-hidden="true">{p.unread}</span><span className="sr">{p.unread} {c.unreadSr}</span></>}
          </div>
        ))}
      </div>
      <div className="chat-main">
        <div className="chat-top"><I icon={MessageSquare} style={{ color: 'var(--fg-primary)' }} />{t.mock.project}<span className="s">{c.members}</span></div>
        <div className="chat-body">
          <Msg p={P[0]} time="10:42" text={c.m1} />
          <Msg p={P[1]} time="10:45" text={c.m2} />
          <div className="divider" role="separator">{c.newMsgs}</div>
          <Msg p={P[2]} time="11:02" text={c.m3} />
          <div className="cm me"><div className="bb"><span className="who"><b>{c.you}</b><span className="num">11:05</span></span><span className="tx">{c.m4}</span><span className="seen"><I icon={CheckCheck} size={14} />{c.seen}</span></div></div>
        </div>
        <div className="compose" aria-hidden="true"><span className="in">{c.placeholder}</span><span className="snd leaf-sm"><I icon={Send} mirror /></span></div>
      </div>
    </div>
  );
}

const TABS = [
  { id: 'dash', icon: LayoutDashboard, key: 'tDash', Panel: DashPanel },
  { id: 'board', icon: SquareKanban, key: 'tBoard', Panel: BoardPanel },
  { id: 'chat', icon: MessageSquare, key: 'tChat', Panel: ChatPanel },
];

/** WAI-ARIA tabs: roving tabindex, arrows follow the reading direction, Home / End. */
export function Tour({ t, dir }) {
  const [tab, setTab] = useState(0);
  const btns = useRef([]);
  const go = (i) => { setTab(i); btns.current[i]?.focus(); };
  const onKeyDown = (e) => {
    const step = { ArrowRight: dir === 'rtl' ? -1 : 1, ArrowLeft: dir === 'rtl' ? 1 : -1 }[e.key];
    if (step) go((tab + step + TABS.length) % TABS.length);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(TABS.length - 1);
    else return;
    e.preventDefault();
  };
  const { Panel } = TABS[tab];
  const r = t.tour;
  return (
    <section className="sec" id="tour" aria-labelledby="tour-title">
      <div className="wrap">
        <SectionHead center id="tour-title" eyebrow={r.eyebrow} title={r.title} sub={r.sub} />
        <div className="tabs-wrap">
          <div className="tabs leaf-sm" role="tablist" aria-label={r.tabsLabel} onKeyDown={onKeyDown}>
            {TABS.map((x, i) => (
              <button key={x.id} ref={(el) => { btns.current[i] = el; }} type="button" role="tab" id={`tab-${x.id}`}
                className="leaf-sm" aria-selected={tab === i} aria-controls="panel-tour" tabIndex={tab === i ? 0 : -1} onClick={() => setTab(i)}>
                <I icon={x.icon} />{r[x.key]}
              </button>
            ))}
          </div>
        </div>
        <div className="frame leaf rv" id="panel-tour" role="tabpanel" aria-labelledby={`tab-${TABS[tab].id}`} tabIndex={0}>
          <div className="apptop" aria-hidden="true">
            <Logo withWord={false} size={20} />
            <div className="crumbs"><b>{tab === 0 ? r.tDash : t.mock.project}</b></div>
            <div className="stack"><Av person={t.people[1]} /></div>
          </div>
          <Panel key={tab} t={t} />
        </div>
      </div>
    </section>
  );
}
