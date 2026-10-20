import { useRef } from 'react';
import { cx } from '../lib/cx.js';
import { Icon } from '../lib/icons.jsx';

export const tabsClasses = {
  list: 'flex gap-1 border-b border-subtle',
  tab:
    'relative -mb-px inline-flex h-touch items-center gap-2 rounded-t-tight border-b-2 border-transparent px-3 text-label font-medium text-fg-muted ' +
    'transition-colors duration-fast hover:text-fg focus-ring md:h-control ' +
    'aria-selected:border-primary aria-selected:text-fg-primary',
};

/**
 * WAI-ARIA tabs: arrow keys (mirrored in RTL), Home and End move between tabs; only the selected
 * tab is in the Tab order. The page renders the panel with id `${idPrefix}-panel-${value}`.
 * tabs: [{ id, label, icon? }]
 */
export function Tabs({ tabs, value, onChange, label, idPrefix = 'tabs', className }) {
  const refs = useRef({});

  function onKeyDown(e) {
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const next = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[e.key];
    let index = tabs.findIndex((tab) => tab.id === value);
    if (next) index = (index + next + tabs.length) % tabs.length;
    else if (e.key === 'Home') index = 0;
    else if (e.key === 'End') index = tabs.length - 1;
    else return;
    e.preventDefault();
    onChange(tabs[index].id);
    refs.current[tabs[index].id]?.focus();
  }

  return (
    <div role="tablist" aria-label={label} className={cx(tabsClasses.list, className)} onKeyDown={onKeyDown}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          ref={(node) => { refs.current[tab.id] = node; }}
          type="button"
          role="tab"
          id={`${idPrefix}-tab-${tab.id}`}
          aria-selected={tab.id === value}
          aria-controls={`${idPrefix}-panel-${tab.id}`}
          tabIndex={tab.id === value ? 0 : -1}
          className={tabsClasses.tab}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon && <Icon icon={tab.icon} size={16} />}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/** The panel that belongs to a tab. `bare`: no tabs are shown, so render a plain container. */
export function TabPanel({ idPrefix = 'tabs', value, bare = false, children, className }) {
  if (bare) return <div className={className}>{children}</div>;
  return (
    <div role="tabpanel" id={`${idPrefix}-panel-${value}`} aria-labelledby={`${idPrefix}-tab-${value}`} className={className}>
      {children}
    </div>
  );
}
