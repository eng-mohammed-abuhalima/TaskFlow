# Colour & contrast

## Two palette options

**Option A: Pine & Saffron (chosen).** A deep teal-pine primary (OKLCH hue 186), a saffron accent (hue 74) and an "ink" neutral tinted toward the primary (hue 200, chroma ≤ 0.016). Pine reads calm and focused without touching tech-blue; saffron adds warmth that feels regional (spice markets, desert light) without folklore. Status colours come from three supporting hues kept apart by **hue and lightness**: leaf green (150) for done/success, dusk blue (258) for in-progress/info, clay (36) for danger/high priority.

**Option B: Ink & Clay.** A petrol-ink primary (hue 245), a terracotta accent (hue 42) and warm sand neutrals. Editorial and warm, and it photographs well, but:

- the primary sits within a few degrees of the generic SaaS blue and loses identity at small sizes;
- the terracotta accent is too close to the danger red, so "highlight" and "error" would compete in the task list, where both appear on every row;
- sand neutrals make the dark theme muddy brown rather than calm.

**Why A.** It gives one confident brand hue that is unmistakably not stock Tailwind, a warm accent that never collides with any status, and a neutral family that carries the brand into every grey. It also survives dark mode: pine and saffron desaturate gracefully, while terracotta turns orange-neon. Both options are rendered side by side in the *PaletteOptions* card.

Option B, for reference (hex):

| Step | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ink | #f1f8fe | #e3eff9 | #cadff2 | #abcae5 | #89b0d2 | #6693b9 | #4c789c | #375f80 | #274863 | #193348 | #0d202f |
| clay | #fff4f0 | #ffe7de | #ffd1bf | #f6b49a | #e69272 | #ce704a | #b0552f | #913f1b | #712e0f | #521e06 | #371001 |
| sand | #f9f6f2 | #f0ece8 | #dfdcd7 | #c9c5c0 | #aeaaa5 | #918d88 | #77726d | #5f5a55 | #49443f | #342f2a | #221d18 |

## Scales (Option A, OKLCH)

Lightness ladder 0.975 → 0.235, chroma peaking at 500–600 and gamut-clamped to sRGB. These are **raw** variables (`--pine-600`); only the semantic tokens below reference them.

| Scale | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **pine** | `#edfaf8` | `#dbf3ef` | `#bce7e1` | `#94d4cc` | `#65bdb3` | `#30a197` | `#02857b` | `#026962` | `#01514a` | `#013934` | `#002421` |
| **saffron** | `#fff7ed` | `#ffedd7` | `#ffddb1` | `#feca84` | `#f6b24f` | `#e09600` | `#ba7c00` | `#956301` | `#744c01` | `#543600` | `#372100` |
| **ink** | `#f2f8f8` | `#e7eeef` | `#d5dedf` | `#bdc8c9` | `#a1aeae` | `#839191` | `#697677` | `#515e5e` | `#3c4848` | `#283333` | `#182020` |
| **clay** | `#fff4f1` | `#ffe7e0` | `#ffd0c3` | `#fdb09b` | `#ee8d72` | `#d6694b` | `#b84d30` | `#97371d` | `#762711` | `#571807` | `#3a0c02` |
| **leaf** | `#effaf1` | `#dff3e2` | `#c4e7ca` | `#a1d5ab` | `#7abd88` | `#52a266` | `#34864c` | `#1e6c37` | `#125327` | `#073b19` | `#02260d` |
| **dusk** | `#f2f7ff` | `#e4eefc` | `#cddef6` | `#b0c7eb` | `#8eadd9` | `#6d8fc1` | `#5374a5` | `#3e5c87` | `#2d4669` | `#1e314c` | `#101e33` |

Hex shown for convenience; the source of truth is the OKLCH value in `tokens.json` / `src/index.css`.

## Semantic tokens

Utility = Tailwind class family the token feeds (`bg-`, `text-`, `border-`, `fill-`, `outline-`, `ring-`). `border-subtle` and `border-strong` are border-only.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `canvas` | `{ink-50}` | `oklch(0.185 0.013 205)` | Page background behind everything (body). Dark: soft ink, never #000. |
| `surface` | `oklch(0.993 0.003 200)` | `oklch(0.222 0.014 205)` | Cards, task rows, navbar, filter bar: level 1. |
| `surface-raised` | `oklch(1 0 0)` | `oklch(0.258 0.015 205)` | Modals, menus, toasts, popovers: level 2. In dark it is lighter, not just shadowed. |
| `surface-sunken` | `{ink-100}` | `oklch(0.165 0.012 205)` | Wells: input fields in dark, skeleton base, table headers, code. |
| `field` | `oklch(1 0 0)` | `oklch(0.2 0.013 205)` | Text input, select and checkbox fill. Dark: recessed below surface so fields read as wells. |
| `surface-hover` | `{ink-100}` | `oklch(0.28 0.015 205)` | Hover fill for rows, ghost buttons, menu items. The grey badge fills (status-todo-soft, priority-low-soft) sit one step darker in light and one step lighter in dark, so they stay visible on a hovered row. |
| `scrim` | `oklch(0.235 0.02 200 / 0.5)` | `oklch(0.1 0.01 205 / 0.66)` | Backdrop behind modals. |
| `fg` | `{ink-900}` | `oklch(0.94 0.008 190)` | Primary text on canvas, surface, surface-raised, surface-sunken. |
| `fg-muted` | `{ink-700}` | `oklch(0.79 0.014 195)` | Secondary text: descriptions, meta, table headers. Same grounds as fg. |
| `fg-subtle` | `oklch(0.525 0.016 200)` | `oklch(0.69 0.016 200)` | Placeholders, timestamps, helper text. Still 4.5:1 on canvas/surface/raised. |
| `fg-primary` | `{pine-700}` | `oklch(0.81 0.07 186)` | Links and primary-tinted text on surface, canvas and primary-soft. |
| `fg-accent` | `{saffron-800}` | `oklch(0.85 0.105 78)` | Saffron text on surface and accent-soft (e.g. "Due today"). |
| `on-primary` | `oklch(1 0 0)` | `oklch(0.2 0.035 190)` | Text/icons on primary and primary-hover fills. Dark theme flips to deep pine. |
| `on-accent` | `{saffron-950}` | `{saffron-950}` | Text on accent fill (count bubbles, brand mark). |
| `on-danger` | `oklch(1 0 0)` | `oklch(0.2 0.045 34)` | Text on danger fills (destructive buttons). |
| `border-subtle` | `{ink-200}` | `oklch(0.32 0.015 205)` | Dividers and card outlines. Decorative: not relied on to find a control. |
| `border-strong` | `oklch(0.6 0.016 200)` | `oklch(0.56 0.016 200)` | Input, select and checkbox outlines: 3:1 on surface and canvas. |
| `primary` | `{pine-700}` | `oklch(0.75 0.075 186)` | Primary buttons, selected states, active nav. Dark: desaturated so it does not glow. |
| `primary-hover` | `{pine-800}` | `oklch(0.81 0.07 186)` | Hover/pressed fill for primary. |
| `primary-soft` | `{pine-100}` | `oklch(0.3 0.045 186)` | Selected row, active filter chip, focus-within tint. |
| `accent` | `{saffron-400}` | `oklch(0.8 0.12 76)` | Warm accent fill: brand mark, unread/count bubble, "today" marker. Use sparingly. |
| `brand-panel` | `{pine-700}` | `oklch(0.3 0.045 186)` | Login/register brand panel behind the TileBoard. Dark: deep pine so the large area does not glow. |
| `on-brand-panel` | `oklch(1 0 0)` | `oklch(0.94 0.008 190)` | Text on brand-panel; TileBoard tiles use it at /8 (scattered) and /15 (sorted). |
| `accent-soft` | `{saffron-100}` | `oklch(0.32 0.055 70)` | Tinted background for accent highlights. |
| `ring` | `oklch(0.6 0.135 66)` | `oklch(0.81 0.12 78)` | Focus ring: 2px outline on the element's own edge (outline-offset -1px), keyboard only. 3:1 on every surface in both themes. |
| `danger` | `{clay-600}` | `oklch(0.71 0.125 34)` | Destructive button fill, error icon, overdue icon. |
| `danger-hover` | `{clay-700}` | `oklch(0.77 0.11 34)` | Hover/pressed for danger. |
| `danger-soft` | `{clay-100}` | `oklch(0.3 0.06 30)` | Error/overdue tinted background, danger-zone panel. |
| `danger-fg` | `{clay-700}` | `oklch(0.83 0.09 36)` | Error text: inline field errors, toast titles, on danger-soft and surface. |
| `success` | `{leaf-600}` | `oklch(0.75 0.11 150)` | Success icon and solid mark. |
| `success-soft` | `{leaf-100}` | `oklch(0.29 0.05 150)` | Success tinted background. |
| `success-fg` | `{leaf-800}` | `oklch(0.84 0.09 150)` | Success text on success-soft and surface. |
| `warning` | `{saffron-600}` | `oklch(0.8 0.13 76)` | Warning icon and solid mark. |
| `warning-soft` | `{saffron-100}` | `oklch(0.31 0.055 72)` | Warning tinted background. |
| `warning-fg` | `{saffron-800}` | `oklch(0.86 0.11 78)` | Warning text on warning-soft and surface. |
| `info` | `{dusk-600}` | `oklch(0.75 0.075 258)` | Info icon and solid mark. |
| `info-soft` | `{dusk-100}` | `oklch(0.29 0.045 258)` | Info tinted background. |
| `info-fg` | `{dusk-700}` | `oklch(0.84 0.06 258)` | Info text on info-soft and surface. |
| `status-todo` | `{ink-600}` | `oklch(0.69 0.016 200)` | To Do: icon/dot. Always beside the label "To Do" + Circle icon. |
| `status-todo-soft` | `{ink-200}` | `oklch(0.33 0.012 205)` | To Do badge background. One step away from surface-hover so it shows on hovered rows. |
| `status-todo-fg` | `{ink-700}` | `oklch(0.85 0.012 200)` | To Do badge text on status-todo-soft. |
| `status-progress` | `{dusk-600}` | `{info}` | In Progress: icon/dot, with CircleDashed/half icon + label. |
| `status-progress-soft` | `{dusk-100}` | `{info-soft}` | In Progress badge background. |
| `status-progress-fg` | `{dusk-800}` | `{info-fg}` | In Progress badge text on status-progress-soft. |
| `status-done` | `{leaf-600}` | `{success}` | Done: icon/dot, with CircleCheck icon + label. |
| `status-done-soft` | `{leaf-100}` | `{success-soft}` | Done badge background. |
| `status-done-fg` | `{leaf-800}` | `{success-fg}` | Done badge text on status-done-soft. |
| `priority-low` | `{ink-600}` | `oklch(0.69 0.016 200)` | Low priority: 1 signal bar + label. |
| `priority-low-soft` | `{ink-200}` | `oklch(0.33 0.012 205)` | Low priority badge background. One step away from surface-hover so it shows on hovered rows. |
| `priority-low-fg` | `{ink-700}` | `oklch(0.85 0.012 200)` | Low priority text on priority-low-soft. |
| `priority-medium` | `{saffron-600}` | `{warning}` | Medium priority: 2 signal bars + label. |
| `priority-medium-soft` | `{saffron-100}` | `{warning-soft}` | Medium priority badge background. |
| `priority-medium-fg` | `{saffron-800}` | `{warning-fg}` | Medium priority text on priority-medium-soft. |
| `priority-high` | `{clay-600}` | `{danger}` | High priority: 3 signal bars + label. |
| `priority-high-soft` | `{clay-100}` | `{danger-soft}` | High priority badge background. |
| `priority-high-fg` | `{clay-800}` | `{danger-fg}` | High priority text on priority-high-soft. |

## Contrast (WCAG 2.x, measured)

Every pair below is computed from the token values (gamut-mapped sRGB). Text needs 4.5:1; marks that carry meaning (icons, dots, control borders, the focus ring) need 3:1. **All pass in both themes.**

| Foreground | On | Light | Dark | Needs |
| --- | --- | --- | --- | --- |
| `fg` | `canvas` | 12.20:1 | 15.64:1 | 4.5:1 |
| `fg` | `surface` | 12.84:1 | 14.44:1 | 4.5:1 |
| `fg` | `surface-raised` | 13.08:1 | 13.08:1 | 4.5:1 |
| `fg` | `surface-sunken` | 11.17:1 | 16.18:1 | 4.5:1 |
| `fg` | `surface-hover` | 11.17:1 | 12.21:1 | 4.5:1 |
| `fg-muted` | `canvas` | 6.31:1 | 9.67:1 | 4.5:1 |
| `fg-muted` | `surface` | 6.64:1 | 8.93:1 | 4.5:1 |
| `fg-muted` | `surface-raised` | 6.77:1 | 8.09:1 | 4.5:1 |
| `fg-muted` | `surface-sunken` | 5.78:1 | 10.00:1 | 4.5:1 |
| `fg-muted` | `surface-hover` | 5.78:1 | 7.55:1 | 4.5:1 |
| `fg-subtle` | `canvas` | 4.99:1 | 6.75:1 | 4.5:1 |
| `fg-subtle` | `surface` | 5.25:1 | 6.23:1 | 4.5:1 |
| `fg-subtle` | `surface-raised` | 5.35:1 | 5.65:1 | 4.5:1 |
| `fg-subtle` | `field` | 5.35:1 | 6.55:1 | 4.5:1 |
| `fg` | `field` | 13.08:1 | 15.18:1 | 4.5:1 |
| `fg-primary` | `canvas` | 6.09:1 | 10.60:1 | 4.5:1 |
| `fg-primary` | `surface` | 6.41:1 | 9.79:1 | 4.5:1 |
| `fg-primary` | `surface-raised` | 6.54:1 | 8.87:1 | 4.5:1 |
| `fg-primary` | `primary-soft` | 5.62:1 | 7.62:1 | 4.5:1 |
| `fg-accent` | `surface` | 7.43:1 | 10.76:1 | 4.5:1 |
| `fg-accent` | `surface-raised` | 7.58:1 | 9.75:1 | 4.5:1 |
| `fg-accent` | `accent-soft` | 6.63:1 | 8.03:1 | 4.5:1 |
| `on-primary` | `primary` | 6.54:1 | 8.34:1 | 4.5:1 |
| `on-primary` | `primary-hover` | 9.27:1 | 10.23:1 | 4.5:1 |
| `on-brand-panel` | `brand-panel` | 6.54:1 | 11.25:1 | 4.5:1 |
| `accent` | `brand-panel` | 3.55:1 | 7.06:1 | 3:1 |
| `on-accent` | `accent` | 8.25:1 | 8.02:1 | 4.5:1 |
| `on-danger` | `danger` | 5.08:1 | 6.76:1 | 4.5:1 |
| `on-danger` | `danger-hover` | 7.28:1 | 8.47:1 | 4.5:1 |
| `danger-fg` | `danger-soft` | 6.14:1 | 8.02:1 | 4.5:1 |
| `danger-fg` | `surface` | 7.14:1 | 9.86:1 | 4.5:1 |
| `danger-fg` | `surface-raised` | 7.28:1 | 8.94:1 | 4.5:1 |
| `danger-fg` | `canvas` | 6.78:1 | 10.68:1 | 4.5:1 |
| `success-fg` | `success-soft` | 7.91:1 | 8.76:1 | 4.5:1 |
| `success-fg` | `surface` | 9.02:1 | 10.86:1 | 4.5:1 |
| `success-fg` | `surface-raised` | 9.19:1 | 9.84:1 | 4.5:1 |
| `warning-fg` | `warning-soft` | 6.63:1 | 8.59:1 | 4.5:1 |
| `warning-fg` | `surface` | 7.43:1 | 11.11:1 | 4.5:1 |
| `warning-fg` | `surface-raised` | 7.58:1 | 10.06:1 | 4.5:1 |
| `info-fg` | `info-soft` | 5.83:1 | 8.66:1 | 4.5:1 |
| `info-fg` | `surface` | 6.71:1 | 10.52:1 | 4.5:1 |
| `info-fg` | `surface-raised` | 6.84:1 | 9.53:1 | 4.5:1 |
| `status-todo-fg` | `status-todo-soft` | 4.96:1 | 7.72:1 | 4.5:1 |
| `status-todo-fg` | `surface-hover` | 5.78:1 | 9.22:1 | 4.5:1 |
| `status-progress-fg` | `status-progress-soft` | 8.20:1 | 8.66:1 | 4.5:1 |
| `status-done-fg` | `status-done-soft` | 7.91:1 | 8.76:1 | 4.5:1 |
| `priority-low-fg` | `priority-low-soft` | 4.96:1 | 7.72:1 | 4.5:1 |
| `priority-medium-fg` | `priority-medium-soft` | 6.63:1 | 8.59:1 | 4.5:1 |
| `priority-high-fg` | `priority-high-soft` | 8.55:1 | 8.02:1 | 4.5:1 |
| `border-strong` | `canvas` | 3.65:1 | 4.03:1 | 3:1 |
| `border-strong` | `surface` | 3.84:1 | 3.72:1 | 3:1 |
| `border-strong` | `surface-raised` | 3.92:1 | 3.37:1 | 3:1 |
| `border-strong` | `field` | 3.92:1 | 3.91:1 | 3:1 |
| `ring` | `canvas` | 3.81:1 | 10.17:1 | 3:1 |
| `ring` | `surface` | 4.01:1 | 9.39:1 | 3:1 |
| `ring` | `surface-raised` | 4.08:1 | 8.51:1 | 3:1 |
| `ring` | `surface-sunken` | 3.49:1 | 10.52:1 | 3:1 |
| `primary` | `canvas` | 6.09:1 | 8.64:1 | 3:1 |
| `primary` | `surface` | 6.41:1 | 7.97:1 | 3:1 |
| `status-todo` | `surface` | 4.63:1 | 6.23:1 | 3:1 |
| `status-todo` | `status-todo-soft` | 3.46:1 | 4.41:1 | 3:1 |
| `status-progress` | `surface` | 4.67:1 | 7.72:1 | 3:1 |
| `status-progress` | `status-progress-soft` | 4.06:1 | 6.35:1 | 3:1 |
| `status-done` | `surface` | 4.41:1 | 8.06:1 | 3:1 |
| `status-done` | `status-done-soft` | 3.87:1 | 6.50:1 | 3:1 |
| `priority-medium` | `surface` | 3.45:1 | 9.04:1 | 3:1 |
| `priority-medium` | `priority-medium-soft` | 3.07:1 | 7.00:1 | 3:1 |
| `priority-high` | `surface` | 4.98:1 | 6.35:1 | 3:1 |
| `priority-high` | `priority-high-soft` | 4.29:1 | 5.16:1 | 3:1 |
| `danger` | `surface` | 4.98:1 | 6.35:1 | 3:1 |
| `danger` | `canvas` | 4.73:1 | 6.87:1 | 3:1 |
| `warning` | `surface` | 3.45:1 | 9.04:1 | 3:1 |

Notes:

- Placeholders use `fg-subtle` and still meet 4.5:1, so hint text never depends on luck.
- `border-subtle` is decorative (cards, dividers) and intentionally below 3:1; every control that must be *found* uses `border-strong`.
- The focus ring is saffron in both themes and is drawn on the element's own edge (`outline-offset: -1px`): half over the border, half on the surface outside it. Its outer half always meets 3:1 against the surface, so it reads on filled buttons too.
- Status, priority and overdue never rely on colour: each pairs a distinct icon (or bar count) with a word.
