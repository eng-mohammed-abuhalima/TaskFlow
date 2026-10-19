# Navbar

Sticky top bar: logo, Dashboard link, New project, language switch, theme switch, user and log out.

## When to use

- Every signed-in screen.

## Props

Navbar: `lang` · `theme` · `onTheme` · `onLang` · `user` · `current` · `onNewProject`. Also exports `Logo`, `ThemeSwitch`, `LanguageSwitch`.

## Usage

```jsx
const { theme, toggleTheme, lang, toggleLang } = usePreferences(); // see Setup

<Navbar lang={lang} theme={theme} onTheme={toggleTheme} onLang={toggleLang}
  user={profile.displayName} current="dashboard" onNewProject={() => navigate('/projects/new')} />
```

## Classes

Exactly as in `components/src/components/Navbar.jsx` (semantic tokens and logical properties only):

```js
export const navbarClasses = {
  root: 'sticky top-0 z-40 border-b border-subtle bg-surface',
  inner: 'mx-auto flex h-16 max-w-page items-center gap-2 px-4 md:gap-4 md:px-6 lg:px-8',
  link:
    'inline-flex h-touch items-center gap-2 rounded-leaf-sm px-3 text-label font-medium text-fg-muted transition-colors duration-fast ' +
    'hover:bg-surface-hover hover:text-fg focus-ring md:h-control aria-[current=page]:bg-primary-soft aria-[current=page]:text-fg-primary',
  tool:
    'inline-flex size-touch items-center justify-center gap-2 rounded-leaf-sm text-fg-muted transition-colors duration-fast ' +
    'hover:bg-surface-hover hover:text-fg focus-ring md:size-control',
  langTool: 'w-auto px-3 text-label font-medium md:w-auto',
};
```

## Accessibility

- `<nav aria-label>`, `aria-current="page"` on the active link. Every tool is 44px on touch, 40px from `md:`.
- The theme switch is labelled with the action ("Switch to dark theme"). The language switch shows the other language in its own script and `lang` ("العربية" / "English").

## RTL

The logo lockup is forced `dir="ltr"` and never mirrored. The log-out icon is mirrored.

## Don't

- Hiding log out inside a menu on desktop.
