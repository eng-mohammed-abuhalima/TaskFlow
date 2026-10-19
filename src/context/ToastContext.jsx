import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Toast, toasterClasses } from '../components/Overlay.jsx';
import { usePrefs } from './PreferencesContext.jsx';

const ToastContext = createContext(null);
const AUTO_DISMISS_MS = 5000;

/** App-wide toasts that survive navigation (e.g. "Project deleted" after leaving the page). */
export function ToastProvider({ children }) {
  const { t } = usePrefs();
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((x) => x.id !== id)), []);

  const showToast = useCallback((toast) => {
    const id = ++nextId.current;
    setToasts((list) => [...list, { ...toast, id }]);
    // Errors stay until dismissed so they can't be missed.
    if (toast.tone !== 'error') setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
  }, [dismiss]);

  const value = useMemo(() => ({ showToast }), [showToast]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={toasterClasses}>
        {toasts.map(({ id, ...toast }) => (
          <Toast key={id} {...toast} onClose={() => dismiss(id)} closeLabel={t('Dismiss', 'إغلاق')} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
