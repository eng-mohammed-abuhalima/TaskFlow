import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { BODY, C, HEAD, LOGO } from './theme.js';

const TILES = [
  { d: 'M6 0H12a2 2 0 0 1 2 2V8a6 6 0 0 1-6 6H2a2 2 0 0 1-2-2V6a6 6 0 0 1 6-6Z', fill: LOGO.p, from: [-40, -40] },
  { d: 'M24 0H30a2 2 0 0 1 2 2V8a6 6 0 0 1-6 6H20a2 2 0 0 1-2-2V6a6 6 0 0 1 6-6Z', fill: LOGO.a, from: [40, -40] },
  { d: 'M6 18H12a2 2 0 0 1 2 2V26a6 6 0 0 1-6 6H2a2 2 0 0 1-2-2V24a6 6 0 0 1 6-6Z', fill: LOGO.p, from: [-40, 40] },
  { d: 'M24 18H30a2 2 0 0 1 2 2V26a6 6 0 0 1-6 6H20a2 2 0 0 1-2-2V24a6 6 0 0 1 6-6Z', fill: LOGO.p, from: [40, 40] },
];

// The TaskFlow tile mark; the four tiles fly in and lock together.
export function Logo({ size = 160, delay = 0 }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <svg width={size} height={size} viewBox="-2 -2 36 36" style={{ overflow: 'visible' }}>
      {TILES.map((t, i) => {
        const p = spring({ frame: frame - delay - i * 4, fps, config: { damping: 14, mass: 0.7 } });
        const [x, y] = t.from.map((v) => v * (1 - p));
        return (
          <path key={i} d={t.d} fill={t.fill} opacity={Math.min(1, p * 1.5)}
            transform={`translate(${x} ${y}) rotate(${(1 - p) * (i % 2 ? 40 : -40)} 16 16)`} />
        );
      })}
    </svg>
  );
}

// Dark backdrop with a soft glow and a slowly drifting dot grid.
export function Backdrop({ glow = 'start' }) {
  const frame = useCurrentFrame();
  const shift = frame * 0.25;
  const gx = glow === 'start' ? '20%' : glow === 'end' ? '80%' : '50%';
  return (
    <AbsoluteFill style={{ background: C.bgDeep }}>
      <AbsoluteFill style={{
        background: `radial-gradient(1000px 700px at ${gx} 40%, oklch(0.35 0.07 186 / 0.55), transparent 70%),
          radial-gradient(700px 500px at 75% 95%, oklch(0.45 0.09 74 / 0.18), transparent 70%)`,
      }} />
      <AbsoluteFill style={{
        backgroundImage: 'radial-gradient(oklch(1 0 0 / 0.07) 1.5px, transparent 1.5px)',
        backgroundSize: '36px 36px',
        backgroundPosition: `${shift}px ${shift * 0.6}px`,
        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
      }} />
    </AbsoluteFill>
  );
}

// A browser window around a screenshot. `zoom` and `focus` drive a slow Ken Burns move inside.
export function BrowserFrame({ src, width = 1120, zoom = [1, 1.06], focus = [50, 0], dur = 150, url = 'taskflow-be3db.web.app', dir = 'ltr' }) {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, dur], [0, 1], { extrapolateRight: 'clamp' });
  const ease = 1 - (1 - t) ** 2;
  const scale = zoom[0] + (zoom[1] - zoom[0]) * ease;
  const height = width / 1.6;
  return (
    <div style={{
      width, borderRadius: 18, overflow: 'hidden', background: '#fff',
      boxShadow: '0 40px 120px oklch(0 0 0 / 0.55), 0 0 0 1px oklch(1 0 0 / 0.08)',
    }}>
      <div dir="ltr" style={{ height: 42, background: 'oklch(0.93 0.008 200)', display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px' }}>
        {['#ec6a5e', '#f4bf4f', '#61c554'].map((c) => <span key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />)}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ fontFamily: BODY, fontSize: 15, color: 'oklch(0.47 0.016 200)', background: '#fff', borderRadius: 8, padding: '4px 40px' }}>
            {url}
          </div>
        </div>
      </div>
      <div style={{ width, height, overflow: 'hidden', position: 'relative' }} dir={dir}>
        <Img src={staticFile(src)} style={{
          width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top',
          transform: `scale(${scale})`, transformOrigin: `${focus[0]}% ${focus[1]}%`,
        }} />
      </div>
    </div>
  );
}

export function PhoneFrame({ src, width = 300, rotate = 0 }) {
  const height = width * (844 / 390);
  return (
    <div style={{
      width: width + 20, height: height + 20, borderRadius: 52, padding: 10, background: 'oklch(0.12 0.01 205)',
      boxShadow: '0 40px 100px oklch(0 0 0 / 0.6), inset 0 0 0 2px oklch(0.4 0.01 205)', transform: `rotate(${rotate}deg)`,
    }}>
      <div style={{ width, height, borderRadius: 42, overflow: 'hidden' }}>
        <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
      </div>
    </div>
  );
}

// Step number, title and subtitle that slide in from the reading start.
export function Caption({ n, title, sub, dir, width = 540 }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sign = dir === 'rtl' ? 1 : -1; // slide from the start edge
  const part = (delay) => {
    const p = spring({ frame: frame - delay, fps, config: { damping: 200 } });
    return { opacity: p, transform: `translateX(${sign * 60 * (1 - p)}px)` };
  };
  const bar = spring({ frame: frame - 4, fps, config: { damping: 200 } });
  return (
    <div dir={dir} style={{ width, textAlign: 'start', color: C.fg }}>
      <div style={{ ...part(0), fontFamily: HEAD, fontSize: 26, fontWeight: 500, color: C.saffron, letterSpacing: dir === 'rtl' ? 0 : 2 }}>
        {String(n).padStart(2, '0')}
      </div>
      <div style={{ height: 4, width: 80 * bar, background: C.saffron, borderRadius: 2, margin: '14px 0 26px' }} />
      <div style={{ ...part(6), fontFamily: HEAD, fontSize: 54, fontWeight: 600, lineHeight: 1.25 }}>{title}</div>
      <div style={{ ...part(12), fontFamily: BODY, fontSize: 28, lineHeight: 1.6, color: C.fgMuted, marginTop: 22 }}>{sub}</div>
    </div>
  );
}

// Entrance for a frame: rises, un-tilts and settles.
export function useEnter(delay = 0, tilt = 8) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 18, mass: 0.9 } });
  return {
    opacity: Math.min(1, p * 1.4),
    transform: `perspective(2000px) translateY(${(1 - p) * 120}px) rotateY(${tilt * (1 - p * 0.75)}deg) scale(${0.9 + 0.1 * p})`,
  };
}
