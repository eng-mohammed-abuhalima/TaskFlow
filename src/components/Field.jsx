import { useId, useRef, useState } from 'react';
import { CircleAlert, ChevronDown, ChevronLeft, ChevronRight, Search, X, Check, CalendarDays, Eye, EyeOff } from 'lucide-react';
import * as RSelect from '@radix-ui/react-select';
import * as Popover from '@radix-ui/react-popover';
import { DayPicker } from 'react-day-picker';
import { ar as arLocale } from 'date-fns/locale/ar';
import { usePortalContainer } from '../lib/portal.jsx';
import { formatDate } from '../lib/i18n.js';
import { cx } from '../lib/cx.js';
import { Icon } from '../lib/icons.jsx';

// #region classes
export const fieldClasses = {
  wrapper: 'flex min-w-0 flex-col gap-1.5',
  label: 'text-label font-medium text-fg',
  required: 'ms-0.5 text-danger-fg',
  // The shared box of every field (no height, so the textarea can size itself).
  box:
    'block w-full min-w-0 rounded-control border border-strong bg-field px-3 font-sans text-body text-fg ' +
    'placeholder:text-fg-subtle transition-[border-color,background-color] duration-fast ease-flow ' +
    'hover:border-fg-muted focus-ring motion-reduce:transition-none ' +
    'aria-invalid:border-danger disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-fg-subtle',
  // One-line controls: 44px on touch, 40px from md.
  height: 'h-touch md:h-control',
  // Typing fields mark focus with a primary border too; pickers (Select, DateField) don't, so
  // opening and closing a menu without choosing leaves the field unchanged.
  typing: 'focus:border-primary',
  // Grows with its content (field-sizing), no resize handle, no visible scrollbar.
  textarea:
    'min-h-24 max-h-60 resize-none py-2 field-sizing-content ' +
    '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
  hint: 'text-body-sm text-fg-subtle',
  error: 'flex items-start gap-1.5 text-body-sm font-medium text-danger-fg',
  count: 'ms-auto text-caption tabular-nums text-fg-subtle',
};
// #endregion
fieldClasses.control = fieldClasses.box + ' ' + fieldClasses.height;

/** Label + control + hint/error, wired with ids. `children(props)` receives the a11y props. */
export function Field({ label, hint, error, required, count, className, children }) {
  const id = useId();
  const hintId = hint ? id + '-hint' : undefined;
  const errId = error ? id + '-err' : undefined;
  const control = children({
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': [errId, hintId].filter(Boolean).join(' ') || undefined,
    'aria-required': required || undefined,
  });
  return (
    <div className={cx(fieldClasses.wrapper, className)}>
      <div className="flex items-baseline gap-2">
        <label htmlFor={id} className={fieldClasses.label}>
          {label}
          {required && <span className={fieldClasses.required} aria-hidden="true">*</span>}
        </label>
        {count && <span className={fieldClasses.count}>{count}</span>}
      </div>
      {control}
      {error ? (
        <p id={errId} className={fieldClasses.error}>
          <Icon icon={CircleAlert} size={16} className="mt-0.5" />
          <span>{error}</span>
        </p>
      ) : (
        hint && <p id={hintId} className={fieldClasses.hint}>{hint}</p>
      )}
    </div>
  );
}

export function TextField({ label, hint, error, required, className, inputClassName, multiline, count, ...input }) {
  return (
    <Field label={label} hint={hint} error={error} required={required} count={count} className={className}>
      {(a11y) =>
        multiline ? (
          <textarea {...a11y} {...input} className={cx(fieldClasses.box, fieldClasses.typing, fieldClasses.textarea, inputClassName)} />
        ) : (
          <input {...a11y} {...input} className={cx(fieldClasses.control, fieldClasses.typing, inputClassName)} />
        )
      }
    </Field>
  );
}

// #region select
export const selectClasses = {
  trigger:
    'flex items-center justify-between gap-2 overflow-hidden whitespace-nowrap pe-3 text-start cursor-pointer data-placeholder:text-fg-subtle ' +
    'data-[state=open]:border-primary [&>span]:min-w-0 [&>span]:truncate',
  changed: 'data-[changed=true]:border-primary',
  // Opened with the mouse/touch: when focus returns on close, don't draw the keyboard ring.
  quiet: 'data-[quiet=true]:focus-visible:outline-none',
  content:
    'z-50 max-h-(--radix-select-content-available-height) min-w-(--radix-select-trigger-width) overflow-hidden ' +
    'rounded-leaf border border-subtle bg-surface-raised p-1 text-fg shadow-pop ' +
    'origin-(--radix-select-content-transform-origin) data-[state=open]:animate-pop-in motion-reduce:animate-none',
  item:
    // First/last rows follow the menu's leaf corners (card radius minus the 5px of border + padding).
    'relative flex min-h-touch cursor-pointer select-none items-center gap-2.5 rounded-tight ps-2.5 pe-8 text-body text-fg outline-none ' +
    'first:rounded-ss-[calc(var(--radius-card)-5px)] last:rounded-ee-[calc(var(--radius-card)-5px)] ' +
    'md:min-h-control-sm data-highlighted:bg-surface-hover data-[state=checked]:font-medium data-[state=checked]:text-fg-primary ' +
    'data-disabled:pointer-events-none data-disabled:opacity-50',
  check: 'absolute end-2.5 inline-flex items-center text-fg-primary',
};
// #endregion

/**
 * Select built on Radix (headless, accessible: typeahead, arrow keys, Esc, RTL via dir).
 * options: [{ value, label, icon? }]. Values must be non-empty strings ("none" for "Unassigned").
 * onChange receives the value. Styling is entirely ours.
 */
export function Select({ label, hint, error, required, options = [], value, defaultValue, onChange, placeholder, disabled, className, name }) {
  const container = usePortalContainer();
  // Primary border only after a NEW value is picked; cleared when focus leaves.
  const [changed, setChanged] = useState(false);
  const [quiet, setQuiet] = useState(false);
  const current = useRef(value ?? defaultValue);
  return (
    <Field label={label} hint={hint} error={error} required={required} className={className}>
      {(a11y) => (
        <RSelect.Root value={value} defaultValue={defaultValue} onValueChange={(v) => { if (v !== current.current) setChanged(true); current.current = v; onChange && onChange(v); }} disabled={disabled} name={name} required={required}>
          <RSelect.Trigger {...a11y} onPointerDown={() => setQuiet(true)} onKeyDown={() => setQuiet(false)} onBlur={() => { setChanged(false); }}
            data-changed={changed} data-quiet={quiet} className={cx(fieldClasses.control, selectClasses.trigger, selectClasses.changed, selectClasses.quiet)}>
            <RSelect.Value placeholder={placeholder} />
            <RSelect.Icon asChild><Icon icon={ChevronDown} className="text-fg-muted transition-transform duration-fast in-data-[state=open]:rotate-180" /></RSelect.Icon>
          </RSelect.Trigger>
          <RSelect.Portal container={container}>
            <RSelect.Content position="popper" sideOffset={6} collisionPadding={12} className={selectClasses.content}>
              <RSelect.Viewport>
                {options.map((o) => (
                  <RSelect.Item key={o.value} value={o.value} disabled={o.disabled} className={selectClasses.item}>
                    <RSelect.ItemText><span className="inline-flex min-w-0 items-center gap-2">{o.icon}<span className="truncate">{o.label}</span></span></RSelect.ItemText>
                    <RSelect.ItemIndicator className={selectClasses.check}><Icon icon={Check} /></RSelect.ItemIndicator>
                  </RSelect.Item>
                ))}
              </RSelect.Viewport>
            </RSelect.Content>
          </RSelect.Portal>
        </RSelect.Root>
      )}
    </Field>
  );
}

// #region date
export const dateClasses = {
  trigger: 'flex items-center justify-between gap-2 overflow-hidden whitespace-nowrap pe-3 text-start cursor-pointer data-[state=open]:border-primary',
  changed: 'data-[changed=true]:border-primary',
  // Opened with the mouse/touch: when focus returns on close, don't draw the keyboard ring.
  quiet: 'data-[quiet=true]:focus-visible:outline-none',
  placeholder: 'text-fg-subtle',
  content:
    'z-50 rounded-leaf border border-subtle bg-surface-raised p-3 text-fg shadow-pop ' +
    'origin-(--radix-popover-content-transform-origin) data-[state=open]:animate-pop-in motion-reduce:animate-none',
  calendar: {
    root: 'relative',
    months: 'flex flex-col',
    month: 'flex flex-col gap-2',
    month_caption: 'flex h-9 items-center ps-1',
    caption_label: 'font-display text-subheading font-semibold text-fg',
    nav: 'absolute end-0 top-0 flex items-center gap-1',
    button_previous: 'inline-flex size-9 items-center justify-center rounded-leaf-sm text-fg-muted hover:bg-surface-hover hover:text-fg focus-ring disabled:opacity-40',
    button_next: 'inline-flex size-9 items-center justify-center rounded-leaf-sm text-fg-muted hover:bg-surface-hover hover:text-fg focus-ring disabled:opacity-40',
    chevron: 'size-4 fill-current',
    month_grid: 'border-collapse',
    weekdays: '',
    weekday: 'h-8 w-10 text-caption font-medium text-fg-subtle',
    week: '',
    day: 'p-0.5 text-center',
    day_button:
      'inline-flex size-9 items-center justify-center rounded-leaf-sm text-body tabular-nums text-fg ' +
      'transition-colors duration-fast hover:bg-surface-hover focus-ring',
    today: '[&>button]:font-semibold [&>button]:text-fg-primary [&>button]:ring-1 [&>button]:ring-primary/50',
    selected: '[&>button]:bg-primary [&>button]:text-on-primary [&>button]:hover:bg-primary-hover [&>button]:ring-0',
    outside: '[&>button]:text-fg-subtle/70',
    disabled: '[&>button]:opacity-40 [&>button]:pointer-events-none',
    hidden: 'invisible',
  },
  footer: 'mt-2 flex items-center justify-between gap-2 border-t border-subtle pt-2',
};
// #endregion

const toISO = (d) => (d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : null);
const fromISO = (s) => { if (!s) return undefined; const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };

/** The calendar grid on its own (react-day-picker, styled with our tokens). Arrows mirror in RTL. */
export function Calendar({ lang = 'en', selected, today, onSelect, className }) {
  return (
    <DayPicker
      mode="single"
      selected={selected}
      defaultMonth={selected || today}
      today={today}
      onSelect={onSelect}
      locale={lang === 'ar' ? arLocale : undefined}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      weekStartsOn={lang === 'ar' ? 6 : 1}
      numerals="latn"
      showOutsideDays
      className={className}
      classNames={dateClasses.calendar}
      components={{ Chevron: ({ orientation }) => <Icon icon={orientation === 'right' ? ChevronRight : ChevronLeft} mirror /> }}
    />
  );
}

/**
 * Date field: an input-styled button that opens a calendar (react-day-picker in a Radix popover).
 * value/defaultValue/onChange use ISO "YYYY-MM-DD" strings (or null). Arabic: Arabic months,
 * Saturday-first weeks, Western digits, mirrored navigation.
 */
export function DateField({ label, hint, error, required, value, defaultValue = null, onChange, lang = 'en', placeholder, className, today, disabled }) {
  const container = usePortalContainer();
  const [inner, setInner] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [changed, setChanged] = useState(false);
  const [quiet, setQuiet] = useState(false);
  const current = value !== undefined ? value : inner;
  const set = (v) => { if (v !== current) setChanged(true); if (value === undefined) setInner(v); onChange && onChange(v); };
  const t = (en, ar) => (lang === 'ar' ? ar : en);
  const todayISO = today || toISO(new Date());
  const selected = fromISO(current);
  return (
    <Field label={label} hint={hint} error={error} required={required} className={className}>
      {(a11y) => (
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger {...a11y} onPointerDown={() => setQuiet(true)} onKeyDown={() => setQuiet(false)} onBlur={() => setChanged(false)}
            data-changed={changed} data-quiet={quiet} disabled={disabled}
            className={cx(fieldClasses.control, dateClasses.trigger, dateClasses.changed, selectClasses.quiet)}>
            {current ? <span className="min-w-0 truncate tabular-nums">{formatDate(current, lang, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              : <span className={cx('min-w-0 truncate', dateClasses.placeholder)}>{placeholder || t('Pick a date', 'اختر تاريخًا')}</span>}
            <Icon icon={CalendarDays} className="text-fg-muted" />
          </Popover.Trigger>
          <Popover.Portal container={container}>
            <Popover.Content align="start" sideOffset={6} collisionPadding={12} className={dateClasses.content}>
              <Calendar lang={lang} selected={selected} today={fromISO(todayISO)}
                onSelect={(d) => { set(toISO(d)); if (d) setOpen(false); }} />
              <div className={dateClasses.footer}>
                <button type="button" onClick={() => { set(todayISO); setOpen(false); }} className="h-8 rounded-tight px-2 text-label font-medium text-fg-primary hover:bg-surface-hover focus-ring">{t('Today', 'اليوم')}</button>
                {current && <button type="button" onClick={() => { set(null); setOpen(false); }} className="h-8 rounded-tight px-2 text-label font-medium text-fg-muted hover:bg-surface-hover hover:text-fg focus-ring">{t('Clear', 'مسح')}</button>}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      )}
    </Field>
  );
}

// #region search
export const searchClasses = {
  icon: 'pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-fg-subtle',
  input: 'ps-9 pe-10 [&::-webkit-search-cancel-button]:appearance-none',
  clear:
    'absolute end-1 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-tight text-fg-subtle ' +
    'hover:bg-surface-hover hover:text-fg focus-ring touch-target',
};
// #endregion
export function SearchField({ label, value, onChange, onClear, clearLabel = 'Clear search', className, hideLabel = true, ...input }) {
  const id = useId();
  return (
    <div className={cx('relative min-w-0', className)}>
      <label htmlFor={id} className={hideLabel ? 'sr-only' : fieldClasses.label}>{label}</label>
      <div className="relative">
        <Icon icon={Search} className={searchClasses.icon} />
        <input
          id={id}
          type="search"
          value={value}
          onChange={onChange}
          className={cx(fieldClasses.control, fieldClasses.typing, searchClasses.input)}
          {...input}
        />
        {value ? (
          <button type="button" onClick={onClear} aria-label={clearLabel} className={searchClasses.clear}>
            <Icon icon={X} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

// #region checkbox
export const checkboxClasses = {
  row: 'group inline-flex min-h-touch cursor-pointer items-center gap-2.5 text-body text-fg md:min-h-control-sm has-disabled:cursor-not-allowed has-disabled:opacity-50',
  box:
    'peer size-[1.125rem] shrink-0 appearance-none rounded-tight border border-strong bg-field ' +
    'transition-[background-color,border-color] duration-fast ease-flow focus-ring ' +
    'checked:border-primary checked:bg-primary hover:border-fg-muted checked:hover:bg-primary-hover motion-reduce:transition-none',
  mark: 'pointer-events-none absolute text-on-primary opacity-0 peer-checked:opacity-100',
};
// #endregion
export function Checkbox({ label, className, ...input }) {
  return (
    <label className={cx(checkboxClasses.row, className)}>
      <span className="relative inline-flex items-center justify-center">
        <input type="checkbox" className={checkboxClasses.box} {...input} />
        <Icon icon={Check} size={14} className={checkboxClasses.mark} />
      </span>
      <span>{label}</span>
    </label>
  );
}

// #region password
export const passwordClasses = {
  toggle:
    'absolute end-1 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-tight text-fg-subtle ' +
    'hover:bg-surface-hover hover:text-fg focus-ring touch-target',
  meter: 'flex items-center gap-2',
  bars: 'grid flex-1 grid-cols-3 gap-1',
  bar: 'h-1 rounded-pill transition-colors duration-base',
  barOff: 'bg-surface-sunken',
  barOn: { 1: 'bg-danger', 2: 'bg-warning', 3: 'bg-success' },
  label: { 1: 'text-danger-fg', 2: 'text-warning-fg', 3: 'text-success-fg' },
};
// #endregion

/** 0 = empty, 1 = weak, 2 = fair, 3 = strong. Length is required for anything above weak. */
export function passwordStrength(pw = '') {
  if (!pw) return 0;
  if (pw.length < 8) return 1;
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length;
  return pw.length >= 12 && kinds >= 3 ? 3 : kinds >= 2 ? 2 : 1;
}

/** Password input with show/hide. Always LTR. `showStrength` adds a 3-step meter with a word (never colour alone). */
export function PasswordField({ label, error, hint, required, lang = 'en', autoComplete = 'current-password', showStrength = false, value, defaultValue, onChange, className, disabled }) {
  const [show, setShow] = useState(false);
  const [inner, setInner] = useState(defaultValue || '');
  const pw = value !== undefined ? value : inner;
  const t = (en, ar) => (lang === 'ar' ? ar : en);
  const score = passwordStrength(pw);
  const word = [null, t('Weak', 'ضعيفة'), t('Fair', 'مقبولة'), t('Strong', 'قوية')][score];
  return (
    <Field label={label} error={error} hint={hint} required={required} className={className}>
      {(a11y) => (
        <div className="flex flex-col gap-2">
          <div className="relative" dir="ltr">
            <input {...a11y} type={show ? 'text' : 'password'} value={pw} disabled={disabled} autoComplete={autoComplete}
              onChange={(e) => { if (value === undefined) setInner(e.target.value); onChange && onChange(e.target.value); }}
              className={cx(fieldClasses.control, fieldClasses.typing, 'pe-11')} />
            <button type="button" onClick={() => setShow(!show)} aria-pressed={show}
              aria-label={show ? t('Hide password', 'إخفاء كلمة المرور') : t('Show password', 'إظهار كلمة المرور')} className={passwordClasses.toggle}>
              <Icon icon={show ? EyeOff : Eye} />
            </button>
          </div>
          {showStrength && score > 0 && (
            <div className={passwordClasses.meter} aria-live="polite">
              <div className={passwordClasses.bars} aria-hidden="true">
                {[1, 2, 3].map((i) => <span key={i} className={cx(passwordClasses.bar, i <= score ? passwordClasses.barOn[score] : passwordClasses.barOff)} />)}
              </div>
              <span className={cx('text-caption font-medium', passwordClasses.label[score])}>
                {t('Strength: ', 'القوة: ')}{word}
              </span>
            </div>
          )}
        </div>
      )}
    </Field>
  );
}
