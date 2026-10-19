// Tiny class helpers: no dependency, cva-style API.
export const cx = (...parts) => parts.flat(Infinity).filter(Boolean).join(' ');

/**
 * variants({ base, variants, compound, defaults }) -> (props) => className
 * Every class string is a complete literal so Tailwind's scanner sees it.
 */
export function variants({ base = '', variants: map = {}, compound = [], defaults = {} }) {
  return (props = {}) => {
    const p = { ...defaults };
    for (const k in props) if (props[k] !== undefined) p[k] = props[k];
    const out = [base];
    for (const key in map) {
      const value = p[key];
      if (value !== undefined && value !== null && map[key][String(value)]) out.push(map[key][String(value)]);
    }
    for (const { class: cls, ...when } of compound) {
      if (Object.entries(when).every(([k, v]) => p[k] === v)) out.push(cls);
    }
    out.push(p.className);
    return cx(out);
  };
}
