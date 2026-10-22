import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { COPY, URL_TEXT } from './copy.js';
import { BODY, C, HEAD } from './theme.js';
import { Backdrop, BrowserFrame, Caption, Logo, PhoneFrame, useEnter } from './parts.jsx';

// Scene lengths in frames (30 fps). Seven scenes minus six 15-frame transitions = 900 frames = 30 s.
const T = 15;
const D = { intro: 100, dashboard: 180, project: 165, board: 180, team: 135, phone: 120, outro: 110 };
export const TOTAL = Object.values(D).reduce((a, b) => a + b, 0) - T * (Object.keys(D).length - 1);

// Put a royalty-free track at public/music.mp3 and set this to 'music.mp3' to add sound.
const MUSIC = null;

function Intro({ copy, dir }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const word = spring({ frame: frame - 22, fps, config: { damping: 200 } });
  const tag = spring({ frame: frame - 38, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Backdrop glow="center" />
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36 }}>
        <Logo size={170} />
        <div style={{
          fontFamily: HEAD, fontSize: 120, fontWeight: 600, color: C.fg, letterSpacing: -2,
          opacity: word, transform: `translateY(${(1 - word) * 30}px)`, clipPath: `inset(0 ${(1 - word) * 50}% 0 ${(1 - word) * 50}%)`,
        }}>TaskFlow</div>
        <div dir={dir} style={{ fontFamily: BODY, fontSize: 38, color: C.fgMuted, opacity: tag, transform: `translateY(${(1 - tag) * 20}px)` }}>
          {copy.tagline}
        </div>
      </div>
    </AbsoluteFill>
  );
}

function Feature({ n, text, src, dir, dur, zoom, focus, glow }) {
  const tilt = dir === 'rtl' ? 8 : -8;
  const enter = useEnter(4, tilt);
  return (
    <AbsoluteFill>
      <Backdrop glow={glow} />
      <AbsoluteFill dir={dir} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 60, padding: '0 70px' }}>
        <Caption n={n} title={text.title} sub={text.sub} dir={dir} />
        <div style={enter}>
          <BrowserFrame src={src} width={1200} dur={dur} zoom={zoom} focus={focus} dir={dir} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

function Phones({ copy, lang, dir }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = useEnter(2, 0);
  const b = useEnter(10, 0);
  return (
    <AbsoluteFill>
      <Backdrop glow={dir === 'rtl' ? 'start' : 'end'} />
      <AbsoluteFill dir={dir} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 120 }}>
        <div dir={dir} style={{ width: 600, color: C.fg }}>
          <Caption n={5} title={copy.phone.title} sub="" dir={dir} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 10 }}>
            {copy.phone.chips.map((c, i) => {
              const p = spring({ frame: frame - 14 - i * 6, fps, config: { damping: 200 } });
              return (
                <div key={c} style={{
                  alignSelf: 'flex-start', fontFamily: BODY, fontSize: 32, fontWeight: 500, color: C.fg,
                  padding: '12px 28px', borderRadius: 999, background: 'oklch(1 0 0 / 0.07)', border: `1px solid ${C.line}`,
                  opacity: p, transform: `translateY(${(1 - p) * 20}px)`,
                }}>
                  <span style={{ color: C.saffron, marginInlineEnd: 14 }}>●</span>{c}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
          <div style={a}><PhoneFrame src={`shots/${lang}-phone-dashboard.png`} rotate={-4} /></div>
          <div style={{ ...b, marginTop: 80 }}><PhoneFrame src={`shots/${lang}-phone-project.png`} rotate={4} /></div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

function Outro({ copy, dir }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = (d) => spring({ frame: frame - d, fps, config: { damping: 200 } });
  const pulse = 1 + 0.03 * Math.sin(frame / 6);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Backdrop glow="center" />
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 30 }} dir="ltr">
          <Logo size={110} delay={0} />
          <div style={{ fontFamily: HEAD, fontSize: 96, fontWeight: 600, color: C.fg, opacity: p(10) }}>TaskFlow</div>
        </div>
        <div dir={dir} style={{ fontFamily: HEAD, fontSize: 48, fontWeight: 500, color: C.saffron, opacity: p(18), marginTop: 10 }}>
          {copy.outro.cta}
        </div>
        <div style={{
          fontFamily: BODY, fontSize: 40, fontWeight: 600, color: C.bgDeep, background: C.pineLight,
          padding: '16px 46px', borderRadius: 999, opacity: p(24), transform: `scale(${(0.8 + 0.2 * p(24)) * pulse})`,
        }} dir="ltr">{URL_TEXT}</div>
        <div style={{ fontFamily: BODY, fontSize: 24, color: C.fgMuted, opacity: interpolate(frame, [36, 50], [0, 0.9], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), marginTop: 16 }} dir="ltr">
          {copy.outro.built}
        </div>
      </div>
    </AbsoluteFill>
  );
}

export function TaskFlowVideo({ lang }) {
  const copy = COPY[lang];
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const fromStart = dir === 'rtl' ? 'from-left' : 'from-right';
  const timing = linearTiming({ durationInFrames: T });
  const S = TransitionSeries.Sequence;
  const X = TransitionSeries.Transition;
  return (
    <AbsoluteFill style={{ background: C.bgDeep }}>
      {MUSIC && <Audio src={staticFile(MUSIC)} volume={(f) => interpolate(f, [0, 20, TOTAL - 40, TOTAL], [0, 0.8, 0.8, 0], { extrapolateRight: 'clamp' })} />}
      <TransitionSeries>
        <S durationInFrames={D.intro}><Intro copy={copy} dir={dir} /></S>
        <X presentation={fade()} timing={timing} />
        <S durationInFrames={D.dashboard}>
          <Feature n={1} text={copy.dashboard} src={`shots/${lang}-dashboard.png`} dir={dir} dur={D.dashboard} zoom={[1, 1.07]} focus={[50, 30]} glow="start" />
        </S>
        <X presentation={slide({ direction: fromStart })} timing={timing} />
        <S durationInFrames={D.project}>
          <Feature n={2} text={copy.project} src={`shots/${lang}-project.png`} dir={dir} dur={D.project} zoom={[1, 1.08]} focus={[50, 85]} glow="end" />
        </S>
        <X presentation={slide({ direction: fromStart })} timing={timing} />
        <S durationInFrames={D.board}>
          <Feature n={3} text={copy.board} src={`shots/${lang}-board.png`} dir={dir} dur={D.board} zoom={[1, 1.09]} focus={[50, 92]} glow="start" />
        </S>
        <X presentation={slide({ direction: fromStart })} timing={timing} />
        <S durationInFrames={D.team}>
          <Feature n={4} text={copy.team} src={`shots/${lang}-settings.png`} dir={dir} dur={D.team} zoom={[1, 1.07]} focus={[50, 25]} glow="end" />
        </S>
        <X presentation={fade()} timing={timing} />
        <S durationInFrames={D.phone}><Phones copy={copy} lang={lang} dir={dir} /></S>
        <X presentation={fade()} timing={timing} />
        <S durationInFrames={D.outro}><Outro copy={copy} dir={dir} /></S>
      </TransitionSeries>
    </AbsoluteFill>
  );
}
