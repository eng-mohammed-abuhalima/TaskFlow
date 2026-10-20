# TaskFlow — خطة التنفيذ مرحلة مرحلة

خريطة كاملة من الإعداد للتسليم. بنشتغل مرحلة وحدة كل مرة، وما بننتقل للي بعدها إلا لما تخلص "معايير الانتهاء" تبعتها.
المرجع: `docs/TaskFlow_SRS.docx` (الأرقام FR / TC / US مأخوذة منه) + الديزاين سيستم في `docs/`.

**ترتيب الأولوية إذا ضاق الوقت (من الـ SRS):** auth → project CRUD → task CRUD → security rules → responsive → assignment/filtering → bonus.

**قاعدة ثابتة:** إنت بتعمل الكوميتات بنفسك. كل مرحلة فيها كوميتات مقترحة صغيرة.

---

## قرارات مفتوحة

| القرار | الوضع |
|---|---|
| React + Vite بدل Next.js (الـ rubric بيعطي Next.js 15 نقطة) | بانتظار رد المدرّب |
| كيف الأعضاء يشوفوا أسماء بعض (عرض الأعضاء + اختيار المسؤول عن المهمة) | يتقرر في المرحلة 5 (الخيارات تحت) |
| الاستضافة: Vercel أو Firebase Hosting | يتقرر في المرحلة 9 |

---

## المرحلة 0 — الإعداد ✅ خلصت

- [x] Vite + React + Tailwind v4 + كل الـ dependencies، ومربوط على GitHub
- [x] `index.html` (سكربت no-flash) و `main.jsx` (الخطوط) و `src/index.css`
- [x] `src/hooks/usePreferences.js` و `src/lib/*` (cx, i18n, icons, portal, useMediaQuery)
- [x] كومبوننتس الديزاين سيستم في `src/components/` (مع `Link` بدل `<a>`)
- [x] `App.jsx` فيه `DirectionProvider` وكل الراوتس (صفحات مؤقتة + 404)
- [x] `.env.example`

---

## المرحلة 1 — إعداد Firebase ✅ خلصت

**الهدف:** التطبيق متصل بمشروع Firebase حقيقي، والـ rules مقفلة افتراضياً.

**بإيدك في Firebase Console:**
1. Create project (بدون Google Analytics).
2. Authentication → Sign-in method → فعّل Email/Password.
3. Firestore Database → Create (موقع قريب، مثلاً `europe-west`) → Production mode.
4. Project settings → Add app → Web → انسخ الـ config.

**بالكود:**
- `.env.local` فيه قيم `VITE_FIREBASE_*` (ما بينرفع على Git).
- `src/lib/firebase.js`: `initializeApp` + `getAuth` + `getFirestore`، والقيم من `import.meta.env`.
- `npm i -D firebase-tools` ثم `firebase init firestore` ← بيعمل `firebase.json` و `.firebaserc` و `firestore.rules` و `firestore.indexes.json`.
- `firestore.rules` مبدئياً: كل إشي ممنوع (deny all).

**معايير الانتهاء:** `npm run dev` شغّال بدون أخطاء Firebase بالكونسول، و `firebase deploy --only firestore:rules` نجح.

**كوميتات مقترحة:** `chore: add Firebase client config` · `chore: init Firestore rules (deny all)`

---

## المرحلة 2 — تسجيل الدخول والحماية (FR-01..04, US-01/02) ✅ خلصت

**الهدف:** تسجيل حساب، ودخول، وخروج، والصفحات المحمية ما بتفتح بدون دخول.

**اللي انعمل فعلياً:**
- [x] `services/users.js`: التسجيل والدخول والخروج + ترجمة أخطاء Firebase
- [x] `AuthContext` (فيه `loading` و `registering`) + `PreferencesContext` (الثيم واللغة لكل الصفحات)
- [x] `ProtectedRoute` و `PublicOnlyRoute` و `FullPageLoading`، و `/` بتحوّل حسب حالة الدخول
- [x] صفحات Login و Register على `AuthLayout` (بدون أنيميشن TileBoard، متأجل للمرحلة 11)
- [x] `AppLayout` + Navbar فيه الاسم الحقيقي وزر الخروج
- [x] Rules لـ `users` و `userEmails` (انرفعت)
- [x] اختبارات: TC-01، TC-02، TC-03، TC-04، إيميل مستخدم، الخروج + زر Back، عرض 375 بدون overflow، رفض القراءة والكتابة الممنوعة
- حساب تجربة: `owner@example.test` (الباسورد في `test-accounts.local`، ما بينرفع على Git)
- ملاحظة: الباسورد 8 أحرف على الأقل حسب الديزاين سيستم (Firebase بيطلب 6 بس)

**الملفات:**
- `src/services/users.js`: `register(name, email, password)`. بتعمل حساب Auth + `updateProfile` + بتكتب `users/{uid}` و `userEmails/{emailLowercase}` بنفس الـ batch.
- `src/context/AuthContext.jsx` + `useAuth()`: `onAuthStateChanged`، وحالة `loading` عشان ما يصير وميض أو تحويل غلط عند الـ refresh.
- `src/components/routing/ProtectedRoute.jsx` و `PublicOnlyRoute.jsx`.
- `src/pages/Login.jsx` و `src/pages/Register.jsx`: نبنيهم على `docs/components/src/screens/Login.jsx`. فيهم تحقق من الحقول، والأخطاء جنب الحقل، وزر الإرسال بيتعطّل وقت الحفظ، وترجمة لأخطاء Firebase (`auth/email-already-in-use`, `auth/invalid-credential`, …).
- `src/components/AppLayout.jsx`: الـ Navbar (اسم المستخدم، الثيم، اللغة، تسجيل الخروج) + `<Outlet />`.
- `/` بتحوّل على `/dashboard` أو `/login` حسب حالة الدخول.

**Rules:** `users/{uid}` بيقرأه ويكتبه صاحبه بس. `userEmails/{email}` بينعمل create لما يكون `uid == request.auth.uid` والإيميل هو إيميل الحساب نفسه، وبيقرأه أي حدا عامل دخول (get بس، بدون list).

**الاختبارات:** TC-01، TC-02، TC-03 (refresh بيضل داخل)، TC-04 (الـ dashboard بدون دخول ← login).

**كوميتات مقترحة:** `feat: add auth context and protected routes` · `feat: add register page` · `feat: add login page and logout` · `feat: add users and userEmails rules`

---

## المرحلة 3 — المشاريع CRUD (FR-05/06/18, US-03) ✅ خلصت

**الهدف:** المالك بيعمل مشروع، ويشوفه، ويعدّله، ويحذفه.

**اللي انعمل فعلياً:**
- [x] `services/projects.js` (إنشاء، قائمة، قراءة، تعديل، حذف مع مسح المهام بـ batches)
- [x] `useProject` بحالات loading / ready / notFound / denied / error + `ProjectStatusView`
- [x] صفحات: مشروع جديد، الـ Dashboard (قائمة المشاريع + empty + error + skeleton)، تفاصيل المشروع (هيكل)، الإعدادات (تعديل + حذف بتأكيد)
- [x] `ToastContext` للرسائل، و `ProjectForm` مشترك، و `Breadcrumb`
- [x] Rules للمشاريع + قاعدة مؤقتة للمهام (المالك بيقرأ ويحذف) — انرفعت
- [x] اختبارات بحسابين: TC-05، TC-06، TC-13، 404، الحذف، 6 محاولات اختراق من الكونسول كلها مرفوضة، 375px بالعربي
- إصلاحات جانبية: رابط Dashboard بالـ Navbar كان مفعّل بكل الصفحات؛ بعد الخروج كان الدخول التالي يرجع لصفحة المستخدم السابق؛ النص الإنجليزي جوا الواجهة العربية (utility اسمه `user-text`)
- حساب تاني: `member@example.test` (في `test-accounts.local`)، ومشروع ديمو "Website Redesign 2026"

**الملفات:**
- `src/services/projects.js`: `createProject`، و `listMyProjects(uid)` (`where('memberIds','array-contains',uid)`)، و `getProject`، و `updateProject`، و `deleteProject`.
  - **حذف المشروع:** بنحذف كل المهام اللي تحته بـ batch أول، وبعدين بنحذف المشروع (Firestore ما بيحذف الـ subcollections لحاله).
- `src/pages/NewProject.jsx`: الاسم (3–80، مطلوب) والوصف (≤1000).
- `src/pages/ProjectDetails.jsx`: هيكل الصفحة. إذا المشروع مش موجود بيطلع `StatePage notFound`، وإذا المستخدم مش عضو بيطلع `StatePage denied` بدون ما تظهر أي بيانات.
- `src/pages/ProjectSettings.jsx`: للمالك بس. فيها تعديل الاسم والوصف، و `DangerZone` للحذف مع `ConfirmDialog`.
- `src/hooks/useProject.js`: تحميل المشروع مع حالات loading و error و denied.
- قائمة مشاريع مبدئية في الـ dashboard (`ProjectCard`).

**Rules:** القراءة إذا `request.auth.uid in resource.data.memberIds`. الإنشاء إذا `ownerId == uid` و `memberIds == [uid]` والاسم 3–80 حرف. التعديل والحذف للمالك بس، وبدون تغيير `ownerId`.

**الاختبارات:** TC-05 (المشروع بيضل بعد الـ refresh)، وحساب تاني ما بيشوف المشروع، و TC-13 (رابط مشروع مش إلك ← Access Denied).

**كوميتات مقترحة:** `feat: add projects service` · `feat: add create project page` · `feat: add project details shell with access states` · `feat: add project settings and delete` · `feat: add projects security rules`

---

## المرحلة 4 — المهام CRUD (FR-08..11, US-05/06) ✅ خلصت

**الهدف:** إضافة مهام وتعديلها وحذفها وتغيير حالتها حسب الصلاحيات.

**اللي انعمل فعلياً:**
- [x] `services/tasks.js` (اشتراك مباشر `onSnapshot`، إنشاء، تعديل، حذف) + `useTasks`
- [x] `lib/permissions.js` (نسخة من الـ rules لإخفاء الأزرار) + شروط العنوان في `validation.js`
- [x] `TaskFormModal`: إنشاء وتعديل؛ المهمة الجديدة دايماً "To Do" (FR-11)؛ الحالة بتتقفل لغير المسؤول/المالك
- [x] قائمة المهام بصفحة المشروع + حذف بتأكيد + Toasts + Skeleton + Empty state
- [x] Rules كاملة للمهام (انرفعت)
- [x] اختبارات كمالك: إنشاء/تعديل/حالة/حذف، Overdue بيظهر وبيختفي لما تصير Done، 8 محاولات غلط من الكونسول مرفوضة، حذف مشروع فيه مهام، غريب ما بيقرأ ولا بيضيف، 375px
- إصلاحات: القوائم المنسدلة والتقويم ما كانوا بيشتغلوا جوا الـ Modal (`PortalScope`)؛ تاريخ غلط كان بيوقّع الصفحة (`formatDate` صار آمن)
- **ضايل للمرحلة 5:** اختبار صلاحيات العضو (منشئ / مسؤول) لأنه لازم يكون عضو أول، وأسماء الأعضاء الحقيقية بقائمة المسؤول

**الملفات:**
- `src/services/tasks.js`: `listTasks(projectId)`، و `createTask`، و `updateTask`، و `deleteTask`، و `setTaskStatus`. فيها `serverTimestamp()` لـ createdAt و updatedAt، و `dueDate` بصيغة نص `YYYY-MM-DD` أو `null`.
- `src/lib/permissions.js`: `canEditTask`، و `canDeleteTask`، و `canChangeStatus`، و `isOwner`. بتطابق الـ rules، وبنستخدمها لإخفاء الأزرار بس، مش كحماية.
- `src/lib/validation.js`: قواعد الطول والقيم المسموحة (status و priority).
- في `ProjectDetails`: `TaskList` و `TaskRow`، و `Modal` + `TaskForm` للإضافة والتعديل، و `ConfirmDialog` للحذف، و `Toast` للنجاح والفشل.

**Rules (أهم جزء):**
- القراءة: أعضاء المشروع (`get(/projects/$(pid)).data.memberIds`).
- الإنشاء: عضو، و `createdBy == uid`، والعنوان 3–120، و status من القيم المسموحة، و `assigneeId` إما null أو عضو.
- التعديل: المالك أي إشي. العضو إذا هو اللي عمل المهمة أو مسؤول عنها. تغيير `status` بس للمسؤول عن المهمة (أو المالك). `createdBy` ما بيتغير.
- الحذف: المالك أو اللي عمل المهمة.

**الاختبارات:** TC-09 (بدون عنوان ← ما بيحفظ)، TC-10، و US-06 (عضو بيحاول يغيّر حالة مهمة مش إله ← مرفوض).

**كوميتات مقترحة:** `feat: add tasks service and validation` · `feat: add task list to project page` · `feat: add create/edit task modal` · `feat: add task delete and status change` · `feat: add tasks security rules`

---

## المرحلة 5 — الأعضاء والتعيين (FR-07/12, US-04) ✅ خلصت

**الهدف:** المالك بيضيف عضو بالإيميل ويشيله، والمهمة بتتعيّن لعضو بس.

**اللي انعمل فعلياً (القرار: الخيار أ):**
- [x] المشروع بيخزّن `members: { uid: { displayName } }` جنب `memberIds`؛ و `userEmails/{email}` صار فيه `displayName` كمان (عشان المالك يشوف مين بيضيف بدون ما يقرأ ملف المستخدم الخاص)
- [x] `services/members.js`: إضافة بالإيميل (بيتجاهل حالة الأحرف)، وإزالة عضو مع إلغاء تعيين مهامه بـ batch واحد
- [x] `useProject` صار مباشر (`onSnapshot`): العضو اللي بينشال وهو فاتح الصفحة بيتحوّل لـ 403 فوراً
- [x] صفحة الإعدادات: `MembersManager` + نافذة تأكيد للإزالة؛ صفحة المشروع: صف الأعضاء؛ كروت الـ dashboard: صور الأعضاء؛ قائمة المسؤول بأسماء حقيقية
- [x] Rules: إضافة عضو واحد موجود فعلاً بس، أو إزالة واحد بس، المالك ما بينشال، حد أقصى 20، ما في تعديل أسماء
- [x] اختبارات: TC-07، TC-08، إضافة مكررة، إضافة نفسك، المالك مقابل العضو (إنشاء/تعديل/حذف/حالة)، 13 محاولة ممنوعة كعضو مرفوضة، 7 تعديلات عضوية غلط كمالك مرفوضة، إزالة والعضو فاتح الصفحة، 375px بالعربي
- ملاحظة: الأسماء نسخة وقت الإضافة (ما في تعديل بروفايل بالتطبيق)
- ملاحظة: `member@example.test` مش عضو بالمشروع هلأ؛ بنرجّع إضافته لما نجهّز بيانات الديمو (مرحلة 9)

**قرار لازم نحسمه أول المرحلة (عرض أسماء الأعضاء):**
- **(أ) مقترح:** نخزّن نسخة مختصرة في المشروع `members: { uid: { displayName, email } }`. سهلة، وما بتكشف ملفات المستخدمين للكل.
- (ب) نسمح بقراءة `users/{uid}` لأي حدا عامل دخول. أبسط، بس بتكشف بيانات أكثر من اللازم، والـ SRS بيطلب نطاق ضيق.

**الملفات:**
- `src/services/members.js`: `addMemberByEmail`، بيدور في `userEmails/{email}`، وإذا الإيميل مش موجود بيطلع خطأ واضح، وإذا العضو مضاف من قبل بيرفضه. و `removeMember`، بـ batch بيشيل العضو من `memberIds` وبيشيل تعيين مهامه (`assigneeId = null`).
- في `ProjectSettings`: `MembersManager`. المالك ما بيقدر يشيل حاله.
- `TaskForm`: قائمة اختيار المسؤول فيها الأعضاء بس.
- `ProjectDetails`: `AvatarStack` و `MemberChip` لعرض الأعضاء.

**الاختبارات:** TC-07 (العضو الجديد بيشوف المشروع)، TC-08 (إيميل مش موجود ← خطأ واضح)، ولما ينشال عضو ما بيعود يقدر يفتح المشروع.

**كوميتات مقترحة:** `feat: add member by email` · `feat: remove member and unassign tasks` · `feat: restrict assignee to project members`

---

## المرحلة 6 — البحث والفلاتر والـ Dashboard (FR-13/14, US-07/08) ✅ خلصت

**اللي انعمل فعلياً:**
- [x] `lib/filterTasks.js`: دالة نقية (بحث بالعنوان بدون حساسية للأحرف + حالة + أولوية + مسؤول/غير مُسندة + **المتأخرة فقط**) بتتجمع بـ AND؛ مجرّبة بـ Node assertions (بما فيها اليوم مش متأخر، المكتملة مش متأخرة، وبحث عربي)
- [x] `lib/taskStats.js`: عدّ الحالات، تقدّم المشروع، وملخص الـ dashboard (المتأخرة الأقدم أول)
- [x] `FilterBar` على صفحة المشروع (+ خيار "المتأخرة فقط")، وعدّاد "x من y"، وحالة "ما في نتائج" مع زر مسح
- [x] Dashboard حقيقي: 4 كروت إحصائيات، المهام حسب الحالة، قائمة المتأخرة (روابط للمشاريع)، وكروت المشاريع بتقدّمها الحقيقي؛ التجميع على الـ client (`useDashboard`) بدون collectionGroup
- [x] اختبارات: TC-11، TC-12، فلتر المسؤول، دمج الفلاتر، ومطابقة أرقام الـ dashboard مع قراءة مستقلة من Firestore (US-08)، 375px بالعربي
- بيانات الديمو الحالية (Appendix A): مشروع "Website Redesign 2026" (5 مهام) ومشروع "Mobile App" (2 مهمة)؛ لاحقاً بنرتّبها بالمرحلة 9
- ملاحظة: الفلاتر بالـ state المحلي (بتنمسح بالـ refresh)

**الملفات:**
- `src/lib/filterTasks.js`: دالة نقية `filterTasks(tasks, { q, status, priority, assignee, overdue })`. فيها فلتر "Overdue" جاهز، لأنه هو تمرين التقييم المباشر.
- `FilterBar` في `ProjectDetails` + `EmptyState` لما ما في نتائج.
- `src/pages/Dashboard.jsx` على نمط `docs/components/src/screens/Dashboard.jsx`:
  - `StatCard`: عدد المشاريع، وكل المهام، والمهام حسب الحالة، والمتأخرة.
  - شبكة `ProjectCard` (التقدم = done/total).
  - قائمة المهام المتأخرة (`isOverdue` + `todayISO()` بتوقيت `Asia/Hebron`).
  - التجميع على الـ client: مهام كل مشروع لحال (بدون collectionGroup).

**الاختبارات:** TC-11، و TC-12، وأرقام الـ dashboard بتطابق اللي في Firestore.

**كوميتات مقترحة:** `feat: add task search and filters` · `feat: add dashboard stats and overdue list`

---

## المرحلة 7 — تقوية الـ Security Rules واختبارها (NFR-08)

- مراجعة كاملة لـ `firestore.rules`: deny by default، وفحص الأنواع والأطوال، وإن `projectId` ما بيتغير، وإن `createdAt` ما بيتغير.
- اختبار يدوي بحسابين، صاحب المشروع و `member`، وحساب ثالث غريب:
  - TC-06: عضو بيحاول يعدّل المشروع ← مرفوض.
  - TC-13: الغريب بيفتح رابط المشروع ← Access Denied بدون بيانات.
  - TC-14: كتابة ممنوعة مباشرة من الكونسول ← مرفوضة.
- (اختياري وقوي للتقييم) Emulator + `@firebase/rules-unit-testing` مع tests تلقائية في `tests/rules.test.js`.
- نوثّق النتائج (screenshots أو جدول) عشان الـ README.

**كوميتات مقترحة:** `fix: tighten Firestore rules` · `test: add security rules tests`

---

## المرحلة 8 — التجربة والـ Responsive وحالات الخطأ (FR-15/16, NFR)

- Skeletons وقت التحميل، و Empty states، و Toast للأخطاء مع "أعد المحاولة".
- TC-16: نفصل الشبكة (DevTools offline) ونتأكد إنه بيطلع خطأ واضح، وما في رسالة نجاح كاذبة.
- TC-15: نفحص على 375 و 768 و 1280، وبالعربي والإنجليزي، والوضع الفاتح والداكن.
- Accessibility: labels، و `focus-ring`، والتنقل بالكيبورد، والـ Modal بيمسك الفوكس.
- `npm run lint` و `npm run build` بدون أخطاء.

**كوميتات مقترحة:** `fix: …` صغيرة لكل مشكلة بنلاقيها.

---

## المرحلة 9 — النشر (FR-17)

- **Vercel (مقترح):** نربط الريبو، ونضيف متغيرات `VITE_FIREBASE_*`، ونعمل `vercel.json` فيه rewrite لكل المسارات على `index.html` (SPA).
  أو **Firebase Hosting:** `firebase init hosting` (public = `dist`، single-page = yes).
- Firebase Auth → Authorized domains: نضيف دومين النشر.
- بيانات الديمو (Appendix A): حسابين للتجربة (owner و member)، ومشروع "Website Redesign"، وأربع مهام وحدة منهن متأخرة. **إنت بتعمل الحسابات بإيدك**، وبنوثّقهم في الـ README كحسابات تجربة.
- نختبر الـ flow كامل على الرابط المنشور.

**كوميتات مقترحة:** `chore: add SPA rewrites for deployment`

---

## المرحلة 10 — التوثيق والتسليم (حزمة التسليم في القسم 16 من الـ SRS)

- `README.md`: نبذة، والمميزات، وطريقة التشغيل، ومتغيرات البيئة، وهيكل Firestore، وشرح الـ rules، والقيود المعروفة، ورابط النشر، وحسابات الديمو.
- 5 screenshots على الأقل في `docs/screenshots/` (الدخول، والمشاريع، والمهام، والفلاتر، والموبايل).
- التأكد إن `firestore.rules` موجود بالريبو، وإنه ما في أسرار مرفوعة.
- **تحضير التقييم:**
  - ديمو 5 دقائق.
  - تمرين "Overdue filter" (لازم تشرح الشرط `dueDate < today && status !== 'done'` مع مثال وحالة حدّية).
  - مراجعة الكود: لازم تكون فاهم كل ملف.
- نمشي على قائمة Definition of Done (القسم 20 في الـ SRS).

**كوميتات مقترحة:** `docs: write README` · `docs: add screenshots`

---

## المرحلة 11 — إضافات (Bonus، بس بعد ما يكمل الـ MVP)

- [x] Dark mode بتفضيل محفوظ (موجود من الديزاين سيستم)
- [ ] ترتيب المهام حسب الموعد أو الأولوية (سهل)
- [ ] رسم بسيط لتقدم المهام
- [ ] لوحة Kanban بالسحب والإفلات
- [ ] سجل نشاط لتغييرات المهام
- [x] أنيميشن `TileBoard` في صفحتي الدخول والتسجيل (انعمل بعد المرحلة 5): لوحة 4×3 بالديسكتوب وشريط 6×2 بالموبايل والتابلت، بتشتغل مرة وحدة لكل تحميل صفحة، والتنقل بين الدخول والتسجيل بيعرضها جاهزة (`instant`)، و`prefers-reduced-motion` بيعرضها جاهزة بدون حركة
