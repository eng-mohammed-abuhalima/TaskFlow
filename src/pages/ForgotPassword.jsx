import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { AuthLayout, AuthAlert, AuthNotice, authClasses } from '../components/AuthLayout.jsx';
import { Button } from '../components/Button.jsx';
import { TextField } from '../components/Field.jsx';
import { Icon } from '../lib/icons.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { usePrefs } from '../context/PreferencesContext.jsx';
import { sendPasswordReset, authErrorMessage } from '../services/users.js';
import { validateEmail } from '../lib/validation.js';

export default function ForgotPassword() {
  const { t, lang } = usePrefs();
  usePageTitle(t('Reset password', 'استعادة كلمة المرور'));
  const location = useLocation();
  // Pre-filled with whatever was typed on the sign-in page.
  const [email, setEmail] = useState(location.state?.email || '');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [sentTo, setSentTo] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validateEmail(email, t);
    setError(found || '');
    setFormError('');
    setSentTo('');
    if (found) return;

    setSaving(true);
    try {
      await sendPasswordReset(email, lang);
      setSentTo(email.trim());
    } catch (err) {
      setFormError(authErrorMessage(err, t));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthLayout tagline={[t('Plan the week. Ship the work.', 'خطّط لأسبوعك. أنجز عملك.'), t('Projects, tasks and deadlines for small teams who would rather build than manage.', 'مشاريع ومهام ومواعيد لفرق صغيرة تفضّل البناء على الإدارة.')]}>
      <div className="flex flex-col gap-2">
        <h1 className={authClasses.title}>{t('Reset your password', 'استعادة كلمة المرور')}</h1>
        <p className={authClasses.lead}>
          {t('Enter the email you signed up with and we\'ll send you a link to choose a new password.',
            'أدخل البريد الإلكتروني الذي سجّلت به، وسنرسل إليك رابطًا لاختيار كلمة مرور جديدة.')}
        </p>
      </div>
      {formError && <AuthAlert><span className="font-semibold">{formError}</span></AuthAlert>}
      {/* Firebase doesn't say whether the account exists (enumeration protection), so neither do we. */}
      {sentTo && (
        <AuthNotice>
          {t('If an account exists for ', 'إذا كان هناك حساب مسجّل بالبريد ')}
          <bdi className="font-semibold">{sentTo}</bdi>
          {t(', a reset link is on its way. Check your inbox and spam folder.', '، فسيصلك رابط الاستعادة قريبًا. تحقّق من صندوق الوارد ومجلد الرسائل غير المرغوب فيها.')}
        </AuthNotice>
      )}
      <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
        <TextField label={t('Email', 'البريد الإلكتروني')} type="email" dir="ltr" required autoComplete="email" placeholder="name@team.dev"
          value={email} onChange={(e) => setEmail(e.target.value)} error={error} disabled={saving} />
        <Button type="submit" size="lg" loading={saving} icon={Send} mirrorIcon className="mt-2 w-full">
          {saving
            ? t('Sending…', 'جارٍ الإرسال…')
            : sentTo ? t('Send again', 'إعادة الإرسال') : t('Send reset link', 'إرسال رابط الاستعادة')}
        </Button>
      </form>
      <p className={authClasses.switch}>
        <Link to="/login" className={`${authClasses.link} inline-flex items-center gap-1.5`}>
          <Icon icon={ArrowLeft} size={16} mirror />
          {t('Back to sign in', 'العودة إلى تسجيل الدخول')}
        </Link>
      </p>
    </AuthLayout>
  );
}
