import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AuthLayout, AuthAlert, authClasses } from '../components/AuthLayout.jsx';
import { Button } from '../components/Button.jsx';
import { TextField, PasswordField, Checkbox } from '../components/Field.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { usePrefs } from '../context/PreferencesContext.jsx';
import { loginUser, authErrorMessage } from '../services/users.js';
import { validateEmail, validatePassword, compact } from '../lib/validation.js';

export default function Login() {
  const { t, lang } = usePrefs();
  usePageTitle(t('Sign in', 'تسجيل الدخول'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const found = compact({
      email: validateEmail(email, t),
      // No length rule on sign in: only check that something was typed.
      password: validatePassword(password, t, { checkLength: false }),
    });
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length) return;

    setSaving(true);
    try {
      await loginUser({ email, password, remember });
      // PublicOnlyRoute redirects once onAuthStateChanged fires.
    } catch (err) {
      setFormError(authErrorMessage(err, t));
      setSaving(false);
    }
  }

  return (
    <AuthLayout tagline={[t('Plan the week. Ship the work.', 'خطّط لأسبوعك. أنجز عملك.'), t('Projects, tasks and deadlines for small teams who would rather build than manage.', 'مشاريع ومهام ومواعيد لفرق صغيرة تفضّل البناء على الإدارة.')]}>
      <div className="flex flex-col gap-2">
        <h1 className={authClasses.title}>{t('Welcome back', 'مرحبًا بعودتك')}</h1>
        <p className={authClasses.lead}>{t('Sign in to see your projects and tasks.', 'سجّل الدخول لعرض مشاريعك ومهامك.')}</p>
      </div>
      {formError && <AuthAlert><span className="font-semibold">{formError}</span></AuthAlert>}
      <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
        <TextField label={t('Email', 'البريد الإلكتروني')} type="email" dir="ltr" required autoComplete="email" placeholder="name@team.dev"
          value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} disabled={saving} />
        <PasswordField label={t('Password', 'كلمة المرور')} required lang={lang}
          value={password} onChange={setPassword} error={errors.password} disabled={saving} />
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <Checkbox label={t('Remember me', 'تذكرني')} checked={remember} disabled={saving}
            onChange={(e) => setRemember(e.target.checked)} />
          {/* Carries the typed email over so it doesn't have to be entered twice. */}
          <Link to="/forgot-password" state={{ email }} className={`${authClasses.link} text-body-sm`}>
            {t('Forgot password?', 'نسيت كلمة المرور؟')}
          </Link>
        </div>
        <Button type="submit" size="lg" loading={saving} iconEnd={ArrowRight} mirrorIcon className="mt-2 w-full">
          {saving ? t('Signing in…', 'جارٍ تسجيل الدخول…') : t('Sign in', 'تسجيل الدخول')}
        </Button>
      </form>
      <p className={authClasses.switch}>
        {t('New to TaskFlow?', 'جديد على TaskFlow؟')} <Link to="/register" className={authClasses.link}>{t('Create an account', 'أنشئ حسابًا')}</Link>
      </p>
    </AuthLayout>
  );
}
