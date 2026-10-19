import { useNavigate } from 'react-router-dom';
import { CloudOff } from 'lucide-react';
import { Button } from './Button.jsx';
import { EmptyState, Loading, Skeleton, StatePage } from './States.jsx';
import { usePrefs } from '../context/PreferencesContext.jsx';

/**
 * Renders the non-ready states of useProject(): loading, 404, 403 and network errors.
 * The 403 page says nothing about the project, not even its name.
 */
export function ProjectStatusView({ status, onRetry, deniedMessage }) {
  const { t } = usePrefs();
  const navigate = useNavigate();
  const back = { actionLabel: t('Back to dashboard', 'العودة إلى لوحة التحكم'), onAction: () => navigate('/dashboard') };

  if (status === 'loading') {
    return (
      <Loading label={t('Loading project…', 'جارٍ تحميل المشروع…')} className="mx-auto flex max-w-page flex-col gap-4 px-4 py-6 md:px-6 md:py-8 lg:px-8">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-2/3 max-w-md" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </Loading>
    );
  }
  if (status === 'notFound') {
    return (
      <StatePage kind="notFound" title={t('Project not found', 'المشروع غير موجود')} {...back}>
        {t('This project doesn’t exist or was deleted.', 'هذا المشروع غير موجود أو تم حذفه.')}
      </StatePage>
    );
  }
  if (status === 'denied') {
    return (
      <StatePage kind="denied" title={t('You don’t have access', 'ليست لديك صلاحية الوصول')} {...back}>
        {deniedMessage || t('This page is only available to the project’s members. Ask the owner to add you.', 'هذه الصفحة متاحة لأعضاء المشروع فقط. اطلب من المالك إضافتك.')}
      </StatePage>
    );
  }
  return (
    <main className="mx-auto max-w-page px-4 py-16">
      <EmptyState icon={CloudOff} title={t('Couldn’t load this project', 'تعذّر تحميل هذا المشروع')}
        action={<Button variant="secondary" onClick={onRetry}>{t('Retry', 'إعادة المحاولة')}</Button>}>
        {t('Check your connection and try again.', 'تحقق من الاتصال وحاول مجددًا.')}
      </EmptyState>
    </main>
  );
}
