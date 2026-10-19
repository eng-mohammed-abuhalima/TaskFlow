import { CircleAlert, ArrowRight } from 'lucide-react';
import { Icon } from '../lib/icons.jsx';
import { cx } from '../lib/cx.js';
import { useMediaQuery } from '../lib/useMediaQuery.js';
import { Logo, LanguageSwitch, ThemeSwitch } from '../components/Navbar.jsx';
import { Button } from '../components/Button.jsx';
import { TextField, PasswordField } from '../components/Field.jsx';
import { TileBoard } from '../components/TileBoard.jsx';

/*
  Auth layout, shared by Sign in and Create account.
  - lg (1024+): full-height brand panel at the start, form at the end. Board = 4x3 tiles.
  - md (768–1023): header, a wide brand card (6x2 tiles beside the tagline), the form in a surface card.
  - base (375): header, a compact brand card (6x2 small tiles over the tagline), the form full width.
  Only one TileBoard is mounted, so the intro plays once at every size.
*/
// #region classes
export const authClasses = {
  root: 'grid min-h-[44rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]',
  panel: 'relative hidden overflow-hidden bg-brand-panel text-on-brand-panel lg:flex lg:flex-col lg:justify-between lg:p-12',
  main: 'flex min-w-0 flex-col px-4 py-5 md:px-10 md:py-8',
  header: 'flex items-center justify-between gap-2',
  card:
    'mt-5 flex flex-col gap-5 overflow-hidden rounded-leaf bg-brand-panel p-5 text-on-brand-panel ' +
    'md:mt-8 md:flex-row md:items-center md:gap-8 md:p-8 lg:hidden',
  body: 'mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 py-8 md:max-w-md lg:max-w-sm lg:py-10',
  form:
    'flex flex-col gap-6 md:rounded-leaf md:border md:border-subtle md:bg-surface md:p-8 md:shadow-card ' +
    'lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none',
  title: 'font-display text-title font-semibold text-fg',
  lead: 'text-body text-fg-muted',
  alert: 'flex items-start gap-2.5 rounded-leaf-sm border border-danger/50 bg-danger-soft p-3 text-body-sm text-danger-fg',
  switch: 'text-center text-body-sm text-fg-muted',
  link: 'rounded-tight font-medium text-fg-primary underline decoration-1 underline-offset-4 hover:decoration-2 focus-ring',
};
// #endregion

export function AuthLayout({ t, lang, theme, onTheme, onLang, replay = 0, tagline, children }) {
  const wide = useMediaQuery('(min-width: 64rem)');
  const [head, sub] = tagline;
  return (
    <div className={authClasses.root}>
      {wide && (
        <aside className={authClasses.panel} aria-hidden="true">
          <TileBoard key={'b' + replay} layout="board" />
          <div className="max-w-sm">
            <p className="font-display text-title font-semibold">{head}</p>
            <p className="mt-3 text-body opacity-85">{sub}</p>
          </div>
        </aside>
      )}
      <main className={authClasses.main}>
        <div className={authClasses.header}>
          <Logo />
          <div className="flex items-center gap-1">
            <LanguageSwitch lang={lang} onToggle={onLang} />
            <ThemeSwitch theme={theme} lang={lang} onToggle={onTheme} />
          </div>
        </div>
        {!wide && (
          <section className={authClasses.card} aria-hidden="true">
            <TileBoard key={'s' + replay} layout="band" className="shrink-0" />
            <div className="min-w-0">
              <p className="font-display text-heading font-semibold md:text-title">{head}</p>
              <p className="mt-2 hidden text-body opacity-85 md:block">{sub}</p>
            </div>
          </section>
        )}
        <div className={authClasses.body}>{children}</div>
      </main>
    </div>
  );
}

function Alert({ children }) {
  return (
    <div role="alert" className={authClasses.alert}>
      <Icon icon={CircleAlert} size={20} />
      <p>{children}</p>
    </div>
  );
}

export function LoginScreen(props) {
  const { t, lang, state } = props;
  const errors = state === 'error';
  const saving = state === 'saving';
  return (
    <AuthLayout {...props} tagline={[t('Plan the week. Ship the work.', 'خطّط لأسبوعك. أنجز عملك.'), t('Projects, tasks and deadlines for small teams who would rather build than manage.', 'مشاريع ومهام ومواعيد لفرق صغيرة تفضّل البناء على الإدارة.')]}>
      <div className={authClasses.form}>
        <div className="flex flex-col gap-2">
          <h1 className={authClasses.title}>{t('Welcome back', 'مرحبًا بعودتك')}</h1>
          <p className={authClasses.lead}>{t('Sign in to see your projects and tasks.', 'سجّل الدخول لعرض مشاريعك ومهامك.')}</p>
        </div>
        {errors && <Alert><span className="font-semibold">{t('Email or password is incorrect.', 'البريد الإلكتروني أو كلمة المرور غير صحيحة.')}</span> {t('Check both and try again.', 'تحقق منهما وحاول مجددًا.')}</Alert>}
        <form key={state} className="flex flex-col gap-4" noValidate onSubmit={(e) => e.preventDefault()}>
          <TextField label={t('Email', 'البريد الإلكتروني')} type="email" dir="ltr" required autoComplete="email" placeholder="name@team.dev"
            defaultValue={errors || saving ? 'sara@team' : ''} error={errors ? t('Enter a valid email address, like name@team.dev', 'أدخل بريدًا إلكترونيًا صحيحًا، مثل name@team.dev') : undefined} disabled={saving} />
          <PasswordField label={t('Password', 'كلمة المرور')} required lang={lang} disabled={saving} defaultValue={errors || saving ? 'hunter2' : ''}
            error={errors ? t('Password must be at least 8 characters', 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل') : undefined} />
          <Button type="submit" size="lg" loading={saving} iconEnd={ArrowRight} mirrorIcon className="mt-2 w-full">
            {saving ? t('Signing in…', 'جارٍ تسجيل الدخول…') : t('Sign in', 'تسجيل الدخول')}
          </Button>
        </form>
        <p className={authClasses.switch}>
          {t('New to TaskFlow?', 'جديد على TaskFlow؟')} <a href="#" className={authClasses.link}>{t('Create an account', 'أنشئ حسابًا')}</a>
        </p>
      </div>
    </AuthLayout>
  );
}

export function RegisterScreen(props) {
  const { t, lang, state } = props;
  const errors = state === 'error';
  const saving = state === 'saving';
  const filled = errors || saving;
  return (
    <AuthLayout {...props} tagline={[t('Bring your team. Start with one project.', 'اجمع فريقك. ابدأ بمشروع واحد.'), t('Create a project, invite teammates who already have an account, and split the work into tasks with owners and dates.', 'أنشئ مشروعًا، أضف زملاءك الذين لديهم حسابات، وقسّم العمل إلى مهام لكل منها مسؤول وموعد.')]}>
      <div className={authClasses.form}>
        <div className="flex flex-col gap-2">
          <h1 className={authClasses.title}>{t('Create your account', 'أنشئ حسابك')}</h1>
          <p className={authClasses.lead}>{t('It takes a minute. You can invite your team after.', 'يستغرق الأمر دقيقة. يمكنك دعوة فريقك بعدها.')}</p>
        </div>
        {errors && (
          <Alert>
            <span className="font-semibold">{t('An account with this email already exists.', 'يوجد حساب بهذا البريد الإلكتروني.')}</span>{' '}
            <a href="#" className="font-medium underline underline-offset-4 focus-ring rounded-tight">{t('Sign in instead', 'سجّل الدخول بدلًا من ذلك')}</a>
          </Alert>
        )}
        <form key={state} className="flex flex-col gap-4" noValidate onSubmit={(e) => e.preventDefault()}>
          <TextField label={t('Full name', 'الاسم الكامل')} required autoComplete="name" placeholder={t('e.g. Sara Haddad', 'مثال: سارة حداد')}
            defaultValue={filled ? t('S', 'س') : ''} disabled={saving}
            hint={t('Shown to teammates on tasks and projects.', 'يظهر لزملائك على المهام والمشاريع.')}
            error={errors ? t('Name needs at least 2 characters', 'يجب أن يتكون الاسم من حرفين على الأقل') : undefined} />
          <TextField label={t('Email', 'البريد الإلكتروني')} type="email" dir="ltr" required autoComplete="email" placeholder="name@team.dev"
            defaultValue={filled ? 'sara@team.dev' : ''} disabled={saving} />
          <PasswordField label={t('Password', 'كلمة المرور')} required lang={lang} showStrength autoComplete="new-password" disabled={saving}
            defaultValue={errors ? 'taskflow' : saving ? 'Taskflow-2026!' : ''}
            hint={t('At least 8 characters. Mix letters, numbers and symbols.', '8 أحرف على الأقل. امزج بين الحروف والأرقام والرموز.')} />
          <Button type="submit" size="lg" loading={saving} iconEnd={ArrowRight} mirrorIcon className="mt-2 w-full">
            {saving ? t('Creating account…', 'جارٍ إنشاء الحساب…') : t('Create account', 'إنشاء الحساب')}
          </Button>
        </form>
        <p className={authClasses.switch}>
          {t('Already have an account?', 'لديك حساب بالفعل؟')} <a href="#" className={authClasses.link}>{t('Sign in', 'سجّل الدخول')}</a>
        </p>
      </div>
    </AuthLayout>
  );
}

export const LOGIN_STATES = [{ value: 'default', label: 'Default' }, { value: 'error', label: 'Errors' }, { value: 'saving', label: 'Submitting' }];
export const REGISTER_STATES = LOGIN_STATES;
