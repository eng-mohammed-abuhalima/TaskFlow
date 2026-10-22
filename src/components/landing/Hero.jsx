import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Plus, List, SquareKanban, Search, TriangleAlert, Lock, Bell } from 'lucide-react';
import { Logo } from '../Navbar.jsx';
import { I, Pill, PriTag, Av, Due, withPeople } from './parts.jsx';

// Where each mock row starts before it is "dealt" into the list (x, y, rotation).
const SCATTER = [['-48px', '-34px', '-5deg'], ['64px', '26px', '4deg'], ['-28px', '44px', '-2deg'], ['80px', '-22px', '6deg'],
  ['-64px', '34px', '-4deg'], ['36px', '-40px', '3deg'], ['-52px', '22px', '-6deg']];

function HeroMock({ t }) {
  const m = t.mock;
  return (
    <div className="visual">
      <div className="frame-back leaf" aria-hidden="true" />
      <div className="frame leaf" role="img" aria-label={t.hero.mockAlt}>
        <div aria-hidden="true">
          <div className="apptop">
            <Logo withWord={false} size={20} />
            <div className="crumbs"><span>{m.projects}</span><I icon={ChevronRight} size={14} mirror /><b>{m.project}</b></div>
            <div className="stack">{t.people.slice(0, 4).map((p) => <Av key={p.i} person={p} />)}</div>
            <span className="mini-btn leaf-sm"><I icon={Plus} size={14} />{m.newTask}</span>
          </div>
          <div className="toolbar">
            <span className="vsw"><span className="on"><I icon={List} size={14} />{m.list}</span><span><I icon={SquareKanban} size={14} />{m.board}</span></span>
            <span className="field"><I icon={Search} size={14} />{m.search}</span>
            <span className="fchip">{m.fStatus}</span>
            <span className="fchip">{m.fAssignee}</span>
            <span className="fchip on"><I icon={TriangleAlert} size={14} />{m.fOverdue}</span>
          </div>
          <div className="thead"><span>{m.hTask}</span><span>{m.hStatus}</span><span>{m.hPri}</span><span>{m.hWho}</span><span>{m.hDue}</span></div>
          {withPeople(t).map((task, i) => {
            const [sx, sy, sr] = SCATTER[i % SCATTER.length];
            return (
              <div key={i} className={task.over ? 'trow over deal' : 'trow deal'}
                style={{ '--d': `${700 + i * 95}ms`, '--sx': sx, '--sy': sy, '--sr': sr }}>
                <div className="c-t"><span className="chk" /><span>{task.title}</span></div>
                <div className="c-s"><Pill status={task.status} label={task.statusLabel} /></div>
                <div className="c-p"><PriTag pri={task.pri} label={task.priLabel} /></div>
                <div className="c-w"><Av person={task.person} /><span className="nm">{task.person.f}</span></div>
                <div className="c-d"><Due text={task.dueText} over={!!task.over} /></div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="float f1 leaf" aria-hidden="true">
        <span className="ico p leaf-sm"><I icon={Bell} /></span>
        <span>{m.notif}<span className="meta">{m.notifTime}</span></span>
      </div>
    </div>
  );
}

export function Hero({ t }) {
  const h = t.hero;
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-bg" aria-hidden="true" />
      <div className="glow g1" aria-hidden="true" />
      <div className="glow g2" aria-hidden="true" />
      <div className="wrap">
        <div className="hero-grid">
          <div>
            <span className="chip enter"><span className="tag-new" lang="ar" dir="ltr">EN · ع</span>{h.chip}</span>
            <h1 id="hero-title">
              <span className="ln"><span>{h.title1}</span></span>{' '}
              <span className="ln"><em>{h.title2}</em></span>
            </h1>
            <p className="lede enter" style={{ animationDelay: '160ms' }}>{h.sub}</p>
            <div className="ctas enter" style={{ animationDelay: '240ms' }}>
              <Link to="/login" className="btn btn-primary btn-lg leaf-sm">{h.cta}<I icon={ArrowRight} className="go" mirror /></Link>
              <a href="#how" className="btn btn-quiet btn-lg leaf-sm">{h.cta2}</a>
            </div>
            <p className="fine enter" style={{ animationDelay: '320ms' }}><I icon={Lock} size={14} />{h.note}</p>
          </div>
          <HeroMock t={t} />
        </div>
      </div>
    </section>
  );
}

export function TrustStrip({ t }) {
  return (
    <section className="trust" aria-label={t.trustLabel}>
      <div className="wrap">
        <ul>
          {t.trust.map((s) => (
            <li key={s.l}>
              <span className="n num">
                <span className="sr">{s.n}</span>
                <span aria-hidden="true"><span className="count" style={{ '--to': parseInt(s.n, 10) || 0 }} />{s.n.replace(/[0-9]/g, '')}</span>
              </span>
              <span className="l">{s.l}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
