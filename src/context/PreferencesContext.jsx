import { createContext, useContext } from 'react';
import { usePreferences } from '../hooks/usePreferences.js';

const PreferencesContext = createContext(null);

/** Shares theme / language (and the t() helper) so pages don't pass them down by hand. */
export function PreferencesProvider({ children }) {
  const prefs = usePreferences();
  return <PreferencesContext.Provider value={prefs}>{children}</PreferencesContext.Provider>;
}

export function usePrefs() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePrefs must be used inside <PreferencesProvider>');
  return ctx;
}
