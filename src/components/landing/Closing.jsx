import { Link } from 'react-router-dom';
import { ArrowRight, Check, X, ChevronDown, Crown, Code, Eye, TriangleAlert, CircleCheck } from 'lucide-react';
import { Logo } from '../Navbar.jsx';
import { I, Pill, Due, SectionHead, STATUS_ICON } from './parts.jsx';
import { LangSeg } from './LandingHeader.jsx';
import { Rotator } from './Rotator.jsx';

function RoleCard({ icon, role, children }) {
  return (
    <article className="rcard leaf">
      <div className="prev" aria-hidden="true">{children}</div>
      <div className="txt">
        <div className="hd"><span className="ico p leaf-sm"><I icon={icon} /></span><h3>{role.title}</h3></div>
        <p>{role.body}</p>
      </div>
      <ul className="ticks">
        {role.points.map((p) => <li key={p}><I icon={Check} size={14} />{p}</li>)}
      </ul>
    </article>
  );
}

/** Who it's for: team leads, developers, everyone else, each with a small view of what they see. */
export function Teams({ t }) {
  const r = t.teams;
  const T = t.tasks;
  return (
    <section className="sec band" id="teams" aria-labelledby="teams-title">
      <div className="wrap">
        <SectionHead center id="teams-title" eyebrow={r.eyebrow} title={r.title} sub={r.sub} />
        <Rotator className="rot-roles" labels={{ ...t.rot, region: r.title }}>
          <RoleCard title={r.lead.title} icon={Crown} role={r.lead}>
            <div className="smini">
              <div className="st"><span className="k"><I icon={CircleCheck} size={14} />{t.dash.s3}</span><span className="v num">29</span></div>
              <div className="st warn"><span className="k"><I icon={TriangleAlert} size={14} />{t.dash.s4}</span><span className="v num">3</span></div>
            </div>
          </RoleCard>
          <RoleCard title={r.dev.title} icon={Code} role={r.dev}>
            <span className="cnt">{r.dev.mine}</span>
            <div className="mine">
              {[T[3], T[1]].map((x) => (
                <div key={x.title} className="r">
                  <span className="t">{x.title}</span>
                  <span className="m"><Pill status={x.status} label={t.status[x.status]} /><Due text={x.due} /></span>
                </div>
              ))}
            </div>
          </RoleCard>
          <RoleCard title={r.rest.title} icon={Eye} role={r.rest}>
            <span className="cnt">{r.rest.progress}</span>
            <div className="sbar"><i className="s1" style={{ width: '15%' }} /><i className="s2" style={{ width: '25%' }} /><i className="s3" style={{ width: '60%' }} /></div>
            <div className="legend">
              {['todo', 'progress', 'done'].map((s, n) => (
                <span key={s} className={`t${n + 1}`}><I icon={STATUS_ICON[s]} size={14} />{t.status[s]}</span>
              ))}
            </div>
          </RoleCard>
        </Rotator>
      </div>
    </section>
  );
}

/** Why TaskFlow: life without it vs with it. */
export function Why({ t }) {
  const w = t.why;
  return (
    <section className="sec" id="why" aria-labelledby="why-title">
      <div className="wrap">
        <SectionHead center id="why-title" eyebrow={w.eyebrow} title={w.title} sub={w.sub} />
        <div className="vs">
          <div className="vcard before leaf rv">
            <h3>{w.before}</h3>
            <ul>{w.bad.map((x) => <li key={x}><span className="mk"><I icon={X} size={14} /></span>{x}</li>)}</ul>
          </div>
          <div className="vs-arrow" aria-hidden="true"><I icon={ArrowRight} size={20} mirror /></div>
          <div className="vcard after leaf rv">
            <h3><Logo withWord={false} size={20} />{w.after}</h3>
            <ul>{w.good.map((x) => <li key={x}><span className="mk"><I icon={Check} size={14} /></span>{x}</li>)}</ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Faq({ t }) {
  return (
    <section className="sec band" id="faq" aria-labelledby="faq-title">
      <div className="wrap">
        <SectionHead center id="faq-title" eyebrow={t.faq.eyebrow} title={t.faq.title} />
        <div className="faq">
          {t.faq.items.map((q) => (
            <details key={q.q} className="leaf rv" name="faq">
              <summary className="leaf"><span>{q.q}</span><I icon={ChevronDown} size={20} /></summary>
              <p className="ans">{q.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

const TILES = ['', 'e', '', '', 'e', '', 'a', '', '', '', 'e', ''];

export function FinalCta({ t }) {
  return (
    <section className="sec cta-sec" aria-labelledby="cta-title">
      <div className="wrap">
        <div className="cta leaf rv">
          <div className="tiles" aria-hidden="true">{TILES.map((c, i) => <i key={i} className={c || undefined} />)}</div>
          <div className="in">
            <h2 id="cta-title">{t.cta.title}</h2>
            <p>{t.cta.sub}</p>
            <Link to="/login" className="btn btn-lg btn-on leaf-sm">{t.cta.btn}<I icon={ArrowRight} className="go" mirror /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingFooter({ t, lang, theme, setLang, setTheme }) {
  const f = t.foot;
  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="ftr-g">
          <div>
            <a href="#top" className="logo" aria-label={t.nav.home}><Logo size={32} /></a>
            <p className="tag">{f.tagline}</p>
          </div>
          <nav aria-labelledby="f-prod">
            <h2 className="fh" id="f-prod">{f.product}</h2>
            <ul>
              {['features', 'how', 'teams', 'why', 'faq'].map((id) => <li key={id}><a href={`#${id}`}>{t.nav[id]}</a></li>)}
            </ul>
          </nav>
          <nav aria-labelledby="f-acc">
            <h2 className="fh" id="f-acc">{f.account}</h2>
            <ul>
              <li><Link to="/login">{t.nav.signin}</Link></li>
              <li><Link to="/register">{f.register}</Link></li>
            </ul>
          </nav>
          <div>
            <h2 className="fh">{f.prefs}</h2>
            <div className="ctrls">
              <LangSeg lang={lang} setLang={setLang} label={t.nav.langLabel} />
              <div className="seg leaf-sm" role="group" aria-label={f.theme}>
                <button type="button" className="leaf-sm" aria-pressed={theme === 'light'} onClick={() => setTheme('light')}>{f.light}</button>
                <button type="button" className="leaf-sm" aria-pressed={theme === 'dark'} onClick={() => setTheme('dark')}>{f.dark}</button>
              </div>
            </div>
          </div>
        </div>
        <div className="bottom"><span className="num">© 2026 TaskFlow</span><span>{f.made}</span></div>
      </div>
    </footer>
  );
}
