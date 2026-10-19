import { useNavigate } from 'react-router-dom';
import { StatePage } from '../components/States.jsx';

export default function NotFound({ t }) {
  const navigate = useNavigate();
  return (
    <StatePage kind="notFound" title={t('Page not found', 'الصفحة غير موجودة')}
      actionLabel={t('Back to dashboard', 'العودة إلى لوحة التحكم')} onAction={() => navigate('/dashboard')}>
      {t('The page you are looking for does not exist or was moved.', 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها.')}
    </StatePage>
  );
}
