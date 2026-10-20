import { useNavigate } from 'react-router-dom';
import { StatePage } from '../components/States.jsx';
import { usePrefs } from '../context/PreferencesContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function NotFound() {
  const { t } = usePrefs();
  const navigate = useNavigate();
  usePageTitle(t('Page not found', 'الصفحة غير موجودة'));
  return (
    <main>
      <StatePage kind="notFound" title={t('Page not found', 'الصفحة غير موجودة')}
        actionLabel={t('Back to dashboard', 'العودة إلى لوحة التحكم')} onAction={() => navigate('/dashboard')}>
        {t('The page you are looking for does not exist or was moved.', 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها.')}
      </StatePage>
    </main>
  );
}
