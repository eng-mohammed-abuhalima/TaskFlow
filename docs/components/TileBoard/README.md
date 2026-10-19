# TileBoard

The brand intro on the login panel: twelve scattered task tiles fall in and bounce, then the saffron focus tile walks a spiral and straightens each tile it touches, ending with the board in order.

## When to use

- Only on the login/register brand panel (desktop, `lg:` and up). It is the one place the product "performs"; nowhere inside the app.

## Props

`className`. No other props: it plays once on mount. Remount it (change its `key`) to replay.

## Usage

```jsx
<aside aria-hidden="true" className="relative hidden overflow-hidden bg-brand-panel text-on-brand-panel lg:flex lg:flex-col lg:justify-between lg:p-12">
  <TileBoard />
  <p className="font-display text-title font-semibold">Plan the week. Ship the work.</p>
</aside>
```

## Classes

Motion: `animate-tile-drop` (900ms: ease-in fall, squash on impact, two shrinking bounces) staggered 55ms per tile in a shuffled order; tidy-up uses `duration-slow ease-snap` (slight overshoot), which is reserved for brand moments.

Exactly as in `components/src/components/TileBoard.jsx` (semantic tokens and logical properties only):

```js
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
```

## Accessibility

- Decorative: the board is `aria-hidden`.
- Runs once and stops after about 3.7s (fall about 1.5s, then 12 hops of 170ms), under WCAG 2.2.2’s 5-second limit for auto-playing motion, so it needs no pause control.
- With `prefers-reduced-motion` it renders the finished, ordered board with no motion at all.

## RTL

The tiles sit in a CSS grid, so the spiral (top row → down the far side → back → into the centre) follows the reading direction: it starts top-right in Arabic. No `rtl:` code needed.

## Don't

- Looping it or replaying it on every visit to the page.
- Using `ease-snap` or the drop keyframes on controls or cards.
- More than one saffron tile: saffron means "the one that needs you".
