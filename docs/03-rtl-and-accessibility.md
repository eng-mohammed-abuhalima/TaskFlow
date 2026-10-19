# RTL & accessibility

## Bilingual rules

- Switch language by setting `lang` and `dir` on `<html>` (`usePreferences().toggleLang`). Never set `dir` per component except for content that is always LTR: emails, URLs, passwords, code (`dir="ltr"` on the field) and the logo lockup.
- Layout uses **logical utilities only**. Physical ones are banned in components:

| Use | Never |
| --- | --- |
| `ms-*` `me-*` | `ml-*` `mr-*` |
| `ps-*` `pe-*` | `pl-*` `pr-*` |
| `start-*` `end-*` | `left-*` `right-*` |
| `text-start` `text-end` | `text-left` `text-right` |
| `border-s` `border-e` | `border-l` `border-r` |
| `rounded-s-*` `rounded-e-*` `rounded-ss-*` `rounded-ee-*`, `rounded-leaf` | `rounded-l-*` `rounded-tl-*` … |
| `inset-x-*`, `mx-*`, `px-*` (symmetric) | — |

- `rtl:` / `ltr:` variants are for edge cases only: mirroring a directional icon (`rtl:-scale-x-100`), or an x-translation on hover (`group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5`).
- **Mirror:** arrows, chevrons, back, log-out, breadcrumb separators, the project-card arrow, progress direction (automatic via logical layout). **Don't mirror:** the logo, checkmarks, plus/close, search, calendar, trash, signal bars, media-like icons, numbers.
- **Numerals:** Western 0–9 in both languages. Use `Intl` with `ar-u-nu-latn`; `tabular-nums` on counts, dates and percentages.
- **Type:** Arabic gets its own sizes and leading via `:lang(ar)` (see Typography), and letter-spacing is forced to 0 for any element inside `lang="ar"`. Do not italicise Arabic.
- **Mixed text:** wrap Latin identifiers inside Arabic sentences in `<bdi>` when they end a sentence or contain punctuation (`<bdi>name@team.dev</bdi>`).
- Every component card in this system renders in light-LTR, light-RTL, dark-LTR and dark-RTL; screens have Theme and Lang toggles.

## Accessibility checklist (WCAG 2.2 AA)

- **Contrast:** all text pairs ≥ 4.5:1 and all meaningful marks ≥ 3:1 in both themes. Measured ratios are listed under *Colour & contrast*.
- **Never colour alone:** status = icon + word; priority = bar count + word; overdue = warning icon + "Overdue"; errors = icon + message.
- **Focus:** `focus-ring` (2px saffron outline on the element's edge, `outline-offset: -1px`, `:focus-visible`) on every interactive element. Never `outline-none` without it. Focus order follows the DOM, which follows the reading direction.
- **Touch targets:** 44×44px minimum on phones: controls use `h-touch` (44px) below `md:`; small/icon buttons add `touch-target` to grow the hit area without changing layout.
- **Forms:** real `<label for>`; errors under the field linked by `aria-describedby`, `aria-invalid` on the control; required marked with `*` and `aria-required`; submit disabled while saving with a visible "Saving…" label.
- **Dialogs:** native `<dialog>` + `showModal()` (focus trap, Esc, inert page); `aria-labelledby`; initial focus on the safe action in confirmations; return focus to the trigger.
- **Pickers:** Radix Select gives `role="combobox"`/`listbox`, typeahead, arrow keys, Home/End and Esc; the date popover traps focus, closes on Esc and returns focus to the field; react-day-picker grids are navigable with arrow keys (mirrored in RTL), PageUp/PageDown for months.
- **Live updates:** filter result count `aria-live="polite"`; toasts `role="status"` (errors `role="alert"`); loading regions `aria-busy` + one `role="status"` message.
- **Landmarks:** `<header>` + `<nav aria-label>`, one `<main>`, `<h1>` per page, `aria-current="page"` on the active nav item and breadcrumb.
- **Motion:** 120–200ms, ease-out only; `motion-reduce:` fallbacks on every transition plus a global `prefers-reduced-motion` guard.
- **Themes:** `color-scheme` follows `data-theme`, so native controls (scrollbars, autofill) match.

## Responsive checks

| Width | Breakpoint | What changes |
| --- | --- | --- |
| 375 | base | Single column. Controls 44px. Stat cards 2×2. Task rows become stacked cards with meta wrapping. Navbar keeps logo, language, theme, log-out; "New project" moves into the page header. Toasts span the width. Sign in / Create account: compact brand card (6×2 small tiles) above a full-width form. |
| 768 | `md:` | Controls 40px. Projects 2 columns. Task list becomes a grid table. Dashboard link appears in the navbar. Side widgets sit in two columns. Task rows stay stacked cards (the table needs 1024px). Auth: wide brand card with tagline beside the tiles, form in a surface card. |
| 1280 | `lg:`/`xl:` | Dashboard gets a 22rem side column. FilterBar is one row. Navbar shows the user name. Task list becomes a table. Auth screens split: brand panel + form. |

The screen cards (*Screens* group) are rendered at exactly 1280, 768 and 375px so each layout can be checked in all four theme/language combinations.
