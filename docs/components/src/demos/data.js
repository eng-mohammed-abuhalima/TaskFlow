export const TODAY = '2026-10-19';
export const MEMBERS = ['Sara Haddad', 'Omar Nasser', 'Lina Khoury', 'Yousef Amin', 'Rana Saleh'];
export const MEMBERS_AR = ['سارة حداد', 'عمر ناصر', 'لينا خوري', 'يوسف أمين', 'رنا صالح'];
export const members = (lang) => (lang === 'ar' ? MEMBERS_AR : MEMBERS);

const P = {
  en: [
    { name: 'Mobile onboarding', description: 'Redesign the first-run flow and wire it to the new auth service.', done: 14, total: 22, overdue: 2, updated: '2026-10-17' },
    { name: 'Billing API v2', description: 'Split invoices from subscriptions; keep the old endpoints alive for one release.', done: 9, total: 10, overdue: 0, updated: '2026-10-18' },
    { name: 'Design system', description: 'Tokens, components and docs for TaskFlow web.', done: 5, total: 16, overdue: 1, updated: '2026-10-12' },
    { name: 'Support inbox', description: 'Triage rules and canned replies.', done: 0, total: 4, overdue: 0, updated: '2026-10-02' },
  ],
  ar: [
    { name: 'تهيئة تطبيق الجوال', description: 'إعادة تصميم تجربة الاستخدام الأولى وربطها بخدمة المصادقة الجديدة.', done: 14, total: 22, overdue: 2, updated: '2026-10-17' },
    { name: 'واجهة الفوترة v2', description: 'فصل الفواتير عن الاشتراكات مع إبقاء النقاط القديمة لإصدار واحد.', done: 9, total: 10, overdue: 0, updated: '2026-10-18' },
    { name: 'نظام التصميم', description: 'الرموز والمكوّنات والتوثيق لواجهة TaskFlow.', done: 5, total: 16, overdue: 1, updated: '2026-10-12' },
    { name: 'صندوق الدعم', description: 'قواعد الفرز والردود الجاهزة.', done: 0, total: 4, overdue: 0, updated: '2026-10-02' },
  ],
};
export const projects = (lang) => P[lang].map((p, i) => ({ ...p, id: 'p' + i, members: members(lang).slice(0, 5 - i) }));

const T = {
  en: [
    ['Build the login form with inline errors', 'Email + password, disable submit while saving.', 'in_progress', 'high', '2026-10-16', 0],
    ['Write Firestore rules for tasks', 'Members read; owner or creator deletes.', 'todo', 'high', '2026-10-18', 1],
    ['Add status and priority filters', null, 'todo', 'medium', '2026-10-24', 2],
    ['Empty and error states', 'No projects, no tasks, no results, failed save.', 'in_progress', 'medium', '2026-10-22', null],
    ['Set up Vite + Tailwind v4', null, 'done', 'low', '2026-10-14', 0],
    ['RTL pass on the dashboard', 'Logical properties only; mirror arrows.', 'todo', 'low', null, 3],
  ],
  ar: [
    ['بناء نموذج الدخول مع أخطاء مضمّنة', 'البريد وكلمة المرور، وتعطيل الإرسال أثناء الحفظ.', 'in_progress', 'high', '2026-10-16', 0],
    ['كتابة قواعد Firestore للمهام', 'الأعضاء يقرؤون، والمالك أو المنشئ يحذف.', 'todo', 'high', '2026-10-18', 1],
    ['إضافة مرشحات الحالة والأولوية', null, 'todo', 'medium', '2026-10-24', 2],
    ['حالات الفراغ والخطأ', 'لا مشاريع، لا مهام، لا نتائج، فشل الحفظ.', 'in_progress', 'medium', '2026-10-22', null],
    ['إعداد Vite و Tailwind v4', null, 'done', 'low', '2026-10-14', 0],
    ['مراجعة الاتجاه RTL للوحة التحكم', 'خصائص منطقية فقط، وعكس الأسهم.', 'todo', 'low', null, 3],
  ],
};
export const tasks = (lang) =>
  T[lang].map(([title, description, status, priority, due, a], i) => ({
    id: 't' + i, title, description, status, priority, due, assignee: a === null ? null : members(lang)[a],
  }));
