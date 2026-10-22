import { Children, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { I } from './parts.jsx';

/**
 * Shows one slide at a time and moves on by itself (WAI-ARIA carousel pattern).
 * Hover or keyboard focus pauses it (the progress bar pauses with it); the pause button stops it;
 * with reduced motion it starts stopped.
 * Children are the slides; each child's `title` prop names it for screen readers.
 * labels: { region, prev, next, pause, play, slide }.
 */
export function Rotator({ children, labels, interval = 6000, className }) {
  const slides = Children.toArray(children).map((c) => ({ key: c.key, title: c.props.title, node: c }));
  const [index, setIndex] = useState(0);
  const [hold, setHold] = useState(false);
  const [stopped, setStopped] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const n = slides.length;
  const go = (k) => setIndex(((k % n) + n) % n);
  const paused = hold || stopped;

  // Time left on the current slide survives a pause (hover / focus), so it resumes where the bar stopped.
  const left = useRef(interval);
  useEffect(() => { left.current = interval; }, [index, interval]);
  useEffect(() => {
    if (paused) return undefined;
    const start = performance.now();
    const id = setTimeout(() => setIndex((i) => (i + 1) % n), left.current);
    return () => { clearTimeout(id); left.current = Math.max(0, left.current - (performance.now() - start)); };
  }, [paused, index, n]);

  return (
    <div
      className={`rot rv ${className || ''} ${paused ? 'held' : ''}`}
      role="region" aria-roledescription="carousel" aria-label={labels.region}
      onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setHold(false); }}
    >
      <div className="rot-stage" aria-live={stopped ? 'polite' : 'off'}>
        {slides.map((s, k) => (
          <div key={s.key} className={k === index ? 'rot-slide on' : 'rot-slide'}
            role="group" aria-roledescription="slide" aria-label={`${k + 1} / ${n}: ${s.title}`}
            aria-hidden={k !== index} inert={k !== index}>
            {s.node}
          </div>
        ))}
      </div>

      <div className="rot-ctrl">
        <button type="button" className="rot-btn" onClick={() => go(index - 1)} aria-label={labels.prev}>
          <I icon={ChevronLeft} size={18} mirror />
        </button>
        <div className="rot-dots">
          {slides.map((s, k) => (
            <button key={s.key} type="button" className={k === index ? 'rot-dot on' : 'rot-dot'}
              aria-label={`${labels.slide} ${k + 1}: ${s.title}`} aria-current={k === index ? 'true' : undefined}
              onClick={() => go(k)}>
              {k === index && (
                <i key={index} className="bar" style={{ animationDuration: `${interval}ms` }} />
              )}
            </button>
          ))}
        </div>
        <button type="button" className="rot-btn" onClick={() => go(index + 1)} aria-label={labels.next}>
          <I icon={ChevronRight} size={18} mirror />
        </button>
        <button type="button" className="rot-btn" onClick={() => setStopped((v) => !v)} aria-label={stopped ? labels.play : labels.pause}>
          <I icon={stopped ? Play : Pause} size={16} />
        </button>
      </div>
    </div>
  );
}
