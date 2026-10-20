import { Component } from 'react';
import { TriangleAlert } from 'lucide-react';
import { Button } from './Button.jsx';
import { statePageClasses } from './States.jsx';
import { Icon } from '../lib/icons.jsx';
import { cx } from '../lib/cx.js';
import { usePrefs } from '../context/PreferencesContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

/**
 * Catches an unexpected error while rendering, so the user gets a message and a way out
 * instead of a blank page. Pass `resetKey={pathname}`: changing it (moving to another page) clears the error
 * without remounting the children that are fine.
 */
export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Unexpected UI error:', error, info.componentStack);
  }

  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  render() {
    return this.state.error ? <CrashPage /> : this.props.children;
  }
}

function CrashPage() {
  const { t } = usePrefs();
  const title = t('Something went wrong', 'حدث خطأ غير متوقع');
  usePageTitle(title);
  return (
    <main className={statePageClasses.root}>
      <span className={cx(statePageClasses.tile, 'bg-danger-soft text-danger-fg')}><Icon icon={TriangleAlert} size={28} /></span>
      <h1 className={statePageClasses.title}>{title}</h1>
      <p className={statePageClasses.body}>
        {t('The page ran into a problem. Your saved data is safe. Reload to try again.', 'واجهت الصفحة مشكلة. بياناتك المحفوظة بأمان. أعد التحميل للمحاولة مجددًا.')}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button onClick={() => window.location.reload()}>{t('Reload page', 'إعادة تحميل الصفحة')}</Button>
        <Button variant="secondary" onClick={() => window.location.assign('/dashboard')}>{t('Back to dashboard', 'العودة إلى لوحة التحكم')}</Button>
      </div>
    </main>
  );
}
