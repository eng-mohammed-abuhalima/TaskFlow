import {
  SquareKanban, ListFilter, LayoutDashboard, MessageSquare, Users, Bell, MonitorSmartphone, Search, TriangleAlert,
  CircleCheck, Undo2, CheckCheck, ChevronDown, Mail, UserPlus, CircleX, WifiOff,
} from 'lucide-react';
import { I, Pill, PriTag, Av, SectionHead, STATUS_ICON } from './parts.jsx';
import { Rotator } from './Rotator.jsx';

function Card({ k, icon, title, body, children }) {
  return (
    <article className={`bcard leaf b-${k}`}>
      <div className="txt">
        <div className="hd"><span className="ico p leaf-sm"><I icon={icon} /></span><h3>{title}</h3></div>
        <p>{body}</p>
      </div>
      <div className="prev" aria-hidden="true">{children}</div>
    </article>
  );
}

function KCol({ status, label, count, children }) {
  return (
    <div className="kcol">
      <div className={`kcol-h t${{ todo: 1, progress: 2, done: 3 }[status]}`}>
        <I icon={STATUS_ICON[status]} size={14} />{label}<span className="ct num">{count}</span>
      </div>
      {children}
    </div>
  );
}

function KCard({ task, pri, person, t, className = 'kc' }) {
  return (
    <div className={className}>
      {task.title}
      <div className="row"><PriTag pri={pri} label={t.pri[pri]} /><Av person={person} /></div>
    </div>
  );
}

export function Features({ t }) {
  const f = t.feat;
  const P = t.people;
  const T = t.tasks;
  return (
    <section className="sec" id="features" aria-labelledby="features-title">
      <div className="wrap">
        <SectionHead id="features-title" eyebrow={f.eyebrow} title={f.title} sub={f.sub} />
        <Rotator labels={{ ...t.rot, region: f.title }}>
          <Card k="k" icon={SquareKanban} title={f.k.title} body={f.k.body}>
            <div className="kmini">
              <KCol status="todo" label={t.status.todo} count={2}>
                <KCard t={t} task={T[0]} pri="high" person={P[0]} />
                <KCard t={t} task={T[6]} pri="low" person={P[3]} />
              </KCol>
              <KCol status="progress" label={t.status.progress} count={1}>
                <KCard t={t} task={T[3]} pri="medium" person={P[1]} />
                <KCard t={t} task={T[5]} pri="medium" person={P[3]} className="kc drag" />
              </KCol>
              <KCol status="done" label={t.status.done} count={2}>
                <KCard t={t} task={T[4]} pri="low" person={P[4]} />
                <div className="kc ghost" />
              </KCol>
            </div>
            <div className="toast leaf-sm"><I icon={CircleCheck} size={14} />{f.k.toast}<span className="u"><I icon={Undo2} size={14} mirror />{f.k.undo}</span></div>
          </Card>

          <Card k="f" icon={ListFilter} title={f.f.title} body={f.f.body}>
            <div className="srch"><I icon={Search} size={14} style={{ color: 'var(--subtle)' }} /><span className="q">{f.f.q}</span><span className="caret" /></div>
            <div className="chips">
              <Pill status="progress" label={t.status.progress} />
              <PriTag pri="high" label={t.pri.high} />
              <span className="fchip on"><I icon={TriangleAlert} size={14} />{t.mock.fOverdue}</span>
            </div>
            <div className="res">
              <span className="cnt">{f.f.count}</span>
              <div className="r"><Av person={P[2]} size="sm" /><span className="t">{T[2].title}</span></div>
            </div>
          </Card>

          <Card k="d" icon={LayoutDashboard} title={f.d.title} body={f.d.body}>
            <div className="smini">
              <div className="st"><span className="k">{t.dash.s2}</span><span className="v num">12</span></div>
              <div className="st warn"><span className="k"><I icon={TriangleAlert} size={14} />{t.dash.s4}</span><span className="v num">3</span></div>
            </div>
            <div className="sbar"><i className="s1" style={{ width: '15%' }} /><i className="s2" style={{ width: '25%' }} /><i className="s3" style={{ width: '60%' }} /></div>
            <div className="legend">
              {[['todo', 1, 7], ['progress', 2, 12], ['done', 3, 29]].map(([s, n, v]) => (
                <span key={s} className={`t${n}`}><I icon={STATUS_ICON[s]} size={14} />{t.status[s]} <b className="num">{v}</b></span>
              ))}
            </div>
          </Card>

          <Card k="c" icon={MessageSquare} title={f.c.title} body={f.c.body}>
            <div className="chat-h"><I icon={MessageSquare} size={14} style={{ color: 'var(--fg-primary)' }} />{t.mock.project}<span className="unread num">2</span></div>
            <div className="msgs">
              <div className="msg"><Av person={P[0]} size="sm" /><span className="b">{f.c.m1}</span></div>
              <div className="swap"><span className="typing"><i /><i /><i /></span><div className="msg me"><span className="b">{f.c.m2}</span></div></div>
              <span className="seen"><I icon={CheckCheck} size={14} />{f.c.seen}</span>
            </div>
          </Card>

          <Card k="p" icon={Users} title={f.p.title} body={f.p.body}>
            <div className="mem">
              <div className="mrow"><Av person={P[1]} /><span className="nm">{P[1].n}</span><span className="own">{t.roles.owner}</span></div>
              <div className="mrow"><Av person={P[0]} /><span className="nm">{P[0].n}</span><span className="sel">{t.roles.manager}<I icon={ChevronDown} size={14} /></span></div>
              <div className="mrow"><Av person={P[2]} /><span className="nm">{P[2].n}</span><span className="sel">{t.roles.contributor}<I icon={ChevronDown} size={14} /></span></div>
              <div className="inv"><span className="in"><I icon={Mail} size={14} /><span dir="ltr">rana@team.dev</span></span><span className="mini-btn leaf-sm">{f.p.invite}</span></div>
            </div>
          </Card>

          <Card k="n" icon={Bell} title={f.n.title} body={f.n.body}>
            <div className="nlist">
              <div className="nrow unr"><span className="ico i3 sm leaf-sm"><I icon={UserPlus} size={14} /></span><span>{f.n.n1}<span className="meta">{f.n.t1}</span></span></div>
              <div className="nrow"><span className="ico d sm leaf-sm"><I icon={CircleX} size={14} /></span><span>{f.n.n2}<span className="quote">{f.n.reason}</span><span className="meta">{f.n.t2}</span></span></div>
            </div>
          </Card>

          <Card k="o" icon={MonitorSmartphone} title={f.o.title} body={f.o.body}>
            <div className="devices">
              <div className="dev d1"><i className="p" style={{ width: '40%' }} /><i /><i style={{ width: '80%' }} /><i style={{ width: '60%' }} /></div>
              <div className="dev d2"><i className="p" style={{ width: '50%' }} /><i /><i style={{ width: '70%' }} /></div>
              <div className="dev d3"><i className="p" /><i /><i style={{ width: '60%' }} /></div>
            </div>
            <div className="offline"><I icon={WifiOff} />{f.o.banner}</div>
          </Card>
        </Rotator>
      </div>
    </section>
  );
}
