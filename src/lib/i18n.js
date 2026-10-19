// Bilingual helpers. Numerals stay Western (0-9) in both languages: "-u-nu-latn".
export const LOCALES = { en: { dir: 'ltr', intl: 'en-GB' }, ar: { dir: 'rtl', intl: 'ar-u-nu-latn' } };
export const tr = (lang) => (en, ar) => (lang === 'ar' ? ar : en);
export function formatDate(iso, lang = 'en', opts = { day: 'numeric', month: 'short' }) {
  if (!iso) return '';
  return new Intl.DateTimeFormat(LOCALES[lang].intl, { ...opts, timeZone: 'UTC' }).format(new Date(iso + 'T00:00:00Z'));
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
/** Overdue: due date before today (app timezone) and status not done. */
export function isOverdue(due, status, today = todayISO()) {
  return Boolean(due) && status !== 'done' && due < today;
}
