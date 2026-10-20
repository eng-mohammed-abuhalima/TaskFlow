import { useEffect, useState } from 'react';
import { cx } from '../lib/cx.js';

/*
  The brand board: scattered tasks fall in, land with a bounce, then the saffron
  "focus" tile walks a spiral through the board and straightens every tile it touches.
  It sits on bg-brand-panel: pine in light, a deep pine in dark so the panel doesn't glow.
  Colours are tokens, not dark: variants, so a light screen nested in a dark page still renders correctly.
  It runs once (about 3.7s, under WCAG's 5s limit for auto-motion) and rests in order.
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
// Where each tile lands slightly "off" before it is put in order (deg, px, px).
const SCATTER = [
  [-14, -6, 4], [9, 5, -3], [-6, 3, 6], [16, -4, -2],
  [7, -5, -4], [-11, 6, 3], [5, -3, 5], [-17, 4, -5],
  [12, 3, 2], [-8, -6, -3], [15, 5, 4], [-5, -4, 6],
];
const DROP_ORDER = [5, 0, 9, 2, 7, 11, 3, 8, 1, 10, 6, 4]; // the order they fall in
const PATHS = {
  board: [0, 1, 2, 3, 7, 11, 10, 9, 8, 4, 5, 6], // 4x3 spiral, outside in, resting on 6
  band: [6, 0, 1, 2, 3, 4, 5, 11, 10, 9, 8, 7],  // 6x2 loop, resting on 7
};
const DROP_STAGGER = 55;
const DROP_MS = 900;
const HOP_MS = 170;

const reduced = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** `instant` renders the finished, ordered board with no motion (like prefers-reduced-motion), for replays. */
export function TileBoard({ layout = 'board', className, instant = false }) {
  const SPIRAL = PATHS[layout];
  const REST_INDEX = SPIRAL[SPIRAL.length - 1];
  const still = instant || reduced();
  const [step, setStep] = useState(still ? SPIRAL.length : -1); // -1 = falling, 0..n-1 = walking, n = at rest

  useEffect(() => {
    if (still) return undefined;
    const timers = [];
    const start = DROP_STAGGER * (COUNT - 1) + DROP_MS + 120;
    for (let s = 0; s <= SPIRAL.length; s++) timers.push(setTimeout(() => setStep(s), start + s * HOP_MS));
    return () => timers.forEach(clearTimeout);
  }, [still, SPIRAL.length]);

  const done = step >= SPIRAL.length;
  const visited = new Set(step < 0 ? [] : SPIRAL.slice(0, Math.min(step + 1, SPIRAL.length)));
  const focus = done ? REST_INDEX : step >= 0 ? SPIRAL[step] : -1;

  return (
    <div className={cx(tileBoardClasses.grid, tileBoardClasses[layout], className)} aria-hidden="true">
      {Array.from({ length: COUNT }).map((_, i) => {
        const [rot, dx, dy] = SCATTER[i];
        const sorted = visited.has(i);
        const state = i === focus ? (done ? tileBoardClasses.rest : tileBoardClasses.focus) : sorted ? tileBoardClasses.sorted : tileBoardClasses.idle;
        return (
          <span key={i} className={still ? 'block' : tileBoardClasses.drop} style={{ animationDelay: DROP_ORDER.indexOf(i) * DROP_STAGGER + 'ms' }}>
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
export const TILE_BOARD = { COLS, COUNT, PATHS, DROP_ORDER, HOP_MS, DROP_MS };
