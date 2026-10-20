import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AuthLayout, AuthAlert, authClasses } from '../components/AuthLayout.jsx';
import { Button } from '../components/Button.jsx';
import { TextField, PasswordField } from '../components/Field.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { usePrefs } from '../context/PreferencesContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { registerUser, authErrorMessage } from '../services/users.js';
import { validateName, validateEmail, validatePassword, compact, PASSWORD_MIN } from '../lib/validation.js';

export default function Register() {
  const { t, lang } = usePrefs();
  usePageTitle(t('Create account', 'إنشاء حساب'));
  const { setRegistering, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const found = compact({
      name: validateName(name, t),
      email: validateEmail(email, t),
      password: validatePassword(password, t),
    });
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length) return;

    setSaving(true);
    setRegistering(true);
    try {
      await registerUser({ name, email, password });
      refreshUser();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setFormError(err);
      setSaving(false);
    } finally {
      setRegistering(false);
    }
  }

  return (
    <AuthLayout tagline={[t('Bring your team. Start with one project.', 'اجمع فريقك. ابدأ بمشروع واحد.'), t('Create a project, add teammates who already have an account, and split the work into tasks with owners and dates.', 'أنشئ مشروعًا، أضف زملاءك الذين لديهم حسابات، وقسّم العمل إلى مهام لكل منها مسؤول وموعد.')]}>
      <div className="flex flex-col gap-2">
        <h1 className={authClasses.title}>{t('Create your account', 'أنشئ حسابك')}</h1>
        <p className={authClasses.lead}>{t('It takes a minute. You can add your team after.', 'يستغرق الأمر دقيقة. يمكنك إضافة فريقك بعدها.')}</p>
      </div>
      {formError && (
        <AuthAlert>
          <span className="font-semibold">{authErrorMessage(formError, t)}</span>
          {formError.code === 'auth/email-already-in-use' && (
            <>
              {' '}
              <Link to="/login" className="rounded-tight font-medium underline underline-offset-4 focus-ring">{t('Sign in instead', 'سجّل الدخول بدلًا من ذلك')}</Link>
            </>
          )}
        </AuthAlert>
      )}
      <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
        <TextField label={t('Full name', 'الاسم الكامل')} required autoComplete="name" placeholder={t('e.g. Sara Haddad', 'مثال: سارة حداد')}
          value={name} onChange={(e) => setName(e.target.value)} error={errors.name} disabled={saving}
          hint={t('Shown to teammates on tasks and projects.', 'يظهر لزملائك على المهام والمشاريع.')} />
        <TextField label={t('Email', 'البريد الإلكتروني')} type="email" dir="ltr" required autoComplete="email" placeholder="name@team.dev"
          value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} disabled={saving} />
        <PasswordField label={t('Password', 'كلمة المرور')} required lang={lang} showStrength autoComplete="new-password"
          value={password} onChange={setPassword} error={errors.password} disabled={saving}
          hint={t(`At least ${PASSWORD_MIN} characters. Mix letters, numbers and symbols.`, `${PASSWORD_MIN} أحرف على الأقل. امزج بين الحروف والأرقام والرموز.`)} />
        <Button type="submit" size="lg" loading={saving} iconEnd={ArrowRight} mirrorIcon className="mt-2 w-full">
          {saving ? t('Creating account…', 'جارٍ إنشاء الحساب…') : t('Create account', 'إنشاء الحساب')}
        </Button>
      </form>
      <p className={authClasses.switch}>
        {t('Already have an account?', 'لديك حساب بالفعل؟')} <Link to="/login" className={authClasses.link}>{t('Sign in', 'سجّل الدخول')}</Link>
      </p>
    </AuthLayout>
  );
}
