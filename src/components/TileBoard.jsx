import { useEffect, useRef, useState } from 'react';
import { cx } from '../lib/cx.js';

/*
  The brand board: scattered tasks fall in, land with a bounce, then the saffron
  "focus" tile walks a spiral through the board and straightens every tile it touches.
  It sits on bg-brand-panel: pine in light, a deep pine in dark so the panel doesn't glow.
  Colours are tokens, not dark: variants, so a light screen nested in a dark page still renders correctly.
  It runs once (about 3.5s; with AuthLayout's move to the corner the whole intro stays under WCAG's
  5s limit for auto-motion) and rests in order. The scatter and the drop order are random on every load.
  prefers-reduced-motion: renders the final, ordered board with no motion.
  Grid order follows the reading direction, so the walk mirrors in RTL with no extra code.
  layout="board": 4x3 of 56px tiles (desktop panel). layout="band": 6x2 of 36px / 48px tiles
  (the brand card on phones and tablets).
*/

// #region classes
export const tileBoardClasses = {
  grid: 'grid w-max',
  board: 'grid-cols-4 gap-3',
  band: 'grid-cols-6 gap-2 md:gap-3',
  drop: 'block animate-tile-drop motion-reduce:animate-none',
  tile:
    // Leaf corners as percentages (18/56 and 4/56 of the desktop tile), so the leaf keeps its exact shape at every size.
    'block rounded-ss-[32%] rounded-ee-[32%] rounded-se-[7%] rounded-es-[7%] transition-[transform,scale,background-color] duration-slow ease-snap ' +
    'motion-reduce:transition-none',
  boardTile: 'size-14',
  bandTile: 'size-9 md:size-12',
  idle: 'bg-on-brand-panel/8',
  sorted: 'bg-on-brand-panel/15',
  focus: 'bg-accent scale-110',
  rest: 'bg-accent',
};
// #endregion

const COLS = 4;
const COUNT = 12;

// A value between min and max, with a random sign.
const jitter = (min, max) => (Math.random() < 0.5 ? -1 : 1) * (min + Math.random() * (max - min));

// Where each tile lands "off" before it is put in order: [deg, px, px]. Offsets are a share of the
// tile so the mess looks the same on 36px and 56px tiles.
function randomScatter(tile) {
  return Array.from({ length: COUNT }, () => [jitter(8, 24), jitter(0.06, 0.2) * tile, jitter(0.06, 0.2) * tile]);
}

// The order they fall in (Fisher–Yates shuffle).
function randomOrder() {
  const order = Array.from({ length: COUNT }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}
const PATHS = {
  board: [0, 1, 2, 3, 7, 11, 10, 9, 8, 4, 5, 6], // 4x3 spiral, outside in, resting on 6
  band: [6, 0, 1, 2, 3, 4, 5, 11, 10, 9, 8, 7],  // 6x2 loop, resting on 7
};
const DROP_STAGGER = 55;
const DROP_MS = 900;
const HOP_MS = 150;

const reduced = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Whether the board will animate: false for `instant` replays and for prefers-reduced-motion. */
export const tileBoardAnimates = (instant = false) => !instant && !reduced();

/**
 * `instant` renders the finished, ordered board with no motion (like prefers-reduced-motion), for replays.
 * `onSorted` is called once the last tile is in order (right away when nothing animates).
 */
export function TileBoard({ layout = 'board', className, instant = false, onSorted }) {
  const SPIRAL = PATHS[layout];
  const REST_INDEX = SPIRAL[SPIRAL.length - 1];
  const still = !tileBoardAnimates(instant);
  const [step, setStep] = useState(still ? SPIRAL.length : -1); // -1 = falling, 0..n-1 = walking, n = at rest
  // Random once per mount, so a re-render never reshuffles tiles mid-animation.
  const [scatter] = useState(() => randomScatter(layout === 'band' ? 36 : 56));
  const [dropOrder] = useState(randomOrder);

  useEffect(() => {
    if (still) return undefined;
    const timers = [];
    const start = DROP_STAGGER * (COUNT - 1) + DROP_MS + 120;
    for (let s = 0; s <= SPIRAL.length; s++) timers.push(setTimeout(() => setStep(s), start + s * HOP_MS));
    return () => timers.forEach(clearTimeout);
  }, [still, SPIRAL.length]);

  const done = step >= SPIRAL.length;
  // Read through a ref so a new callback identity from the parent doesn't re-fire it.
  const onSortedRef = useRef(onSorted);
  useEffect(() => { onSortedRef.current = onSorted; });
  useEffect(() => { if (done) onSortedRef.current?.(); }, [done]);

  const visited = new Set(step < 0 ? [] : SPIRAL.slice(0, Math.min(step + 1, SPIRAL.length)));
  const focus = done ? REST_INDEX : step >= 0 ? SPIRAL[step] : -1;

  return (
    <div className={cx(tileBoardClasses.grid, tileBoardClasses[layout], className)} aria-hidden="true">
      {Array.from({ length: COUNT }).map((_, i) => {
        const [rot, dx, dy] = scatter[i];
        const sorted = visited.has(i);
        const state = i === focus ? (done ? tileBoardClasses.rest : tileBoardClasses.focus) : sorted ? tileBoardClasses.sorted : tileBoardClasses.idle;
        return (
          <span key={i} className={still ? 'block' : tileBoardClasses.drop} style={{ animationDelay: dropOrder.indexOf(i) * DROP_STAGGER + 'ms' }}>
            <span
              className={cx(tileBoardClasses.tile, layout === 'band' ? tileBoardClasses.bandTile : tileBoardClasses.boardTile, state)}
              style={{ transform: sorted ? 'none' : `translate(${dx}px, ${dy}px) rotate(${rot}deg)` }}
            />
          </span>
        );
      })}
    </div>
  );
}
export const TILE_BOARD = { COLS, COUNT, PATHS, DROP_STAGGER, HOP_MS, DROP_MS };
