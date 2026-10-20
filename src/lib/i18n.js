// Bilingual helpers. Numerals stay Western (0-9) in both languages: "-u-nu-latn".
export const LOCALES = { en: { dir: 'ltr', intl: 'en-GB' }, ar: { dir: 'rtl', intl: 'ar-u-nu-latn' } };
export const tr = (lang) => (en, ar) => (lang === 'ar' ? ar : en);
export function formatDate(iso, lang = 'en', opts = { day: 'numeric', month: 'short' }) {
  if (!iso) return '';
  const date = new Date(iso + 'T00:00:00Z');
  // Bad data must never take the page down (e.g. a rejected write still shown by Firestore's local cache).
  if (Number.isNaN(date.getTime())) return String(iso);
  return new Intl.DateTimeFormat(LOCALES[lang].intl, { ...opts, timeZone: 'UTC' }).format(date);
}
export const formatNumber = (n, lang = 'en') => new Intl.NumberFormat(LOCALES[lang].intl).format(n);
/** The app's timezone: "today" is computed here, not in UTC. */
export const APP_TIMEZONE = 'Asia/Hebron';
/** Today as YYYY-MM-DD in the app timezone ('en-CA' formats as ISO). */
export const todayISO = () => new Intl.DateTimeFormat('en-CA', { timeZone: APP_TIMEZONE }).format(new Date());
/** A Firestore Timestamp (or Date) as YYYY-MM-DD in the app timezone, for formatDate(). */
export function timestampToISO(ts) {
  const date = ts?.toDate ? ts.toDate() : ts;
  return date ? new Intl.DateTimeFormat('en-CA', { timeZone: APP_TIMEZONE }).format(date) : '';
}
/** A Firestore Timestamp (or Date) as a clock time ("14:05") in the app timezone. */
export function formatTime(ts, lang = 'en') {
  const date = ts?.toDate ? ts.toDate() : ts;
  if (!date) return '';
  return new Intl.DateTimeFormat(LOCALES[lang].intl, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: APP_TIMEZONE }).format(date);
}
/** The day before a YYYY-MM-DD date. */
export function previousDayISO(iso) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}
/** "Today", "Yesterday" or a full date, for headings over lists grouped by day. */
export function dayLabel(iso, lang = 'en', today = todayISO()) {
  if (iso === today) return lang === 'ar' ? 'اليوم' : 'Today';
  if (iso === previousDayISO(today)) return lang === 'ar' ? 'أمس' : 'Yesterday';
  return formatDate(iso, lang, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
/** Overdue: due date before today (app timezone) and status not done. */
export function isOverdue(due, status, today = todayISO()) {
  return Boolean(due) && status !== 'done' && due < today;
}
