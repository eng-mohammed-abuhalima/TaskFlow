import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase.js';

const AuthContext = createContext(null);

// Plain snapshot so React re-renders when we refresh it (Firebase mutates its User in place).
const snapshot = (u) => (u ? { uid: u.uid, email: u.email, displayName: u.displayName || '' } : null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // True while register is still writing the profile, so PublicOnlyRoute doesn't navigate away mid-way.
  const [registering, setRegistering] = useState(false);

  useEffect(
    () => onAuthStateChanged(auth, (u) => { setUser(snapshot(u)); setLoading(false); }),
    []
  );

  // updateProfile() does not fire onAuthStateChanged, so register calls this after setting the name.
  const refreshUser = useCallback(() => setUser(snapshot(auth.currentUser)), []);

  const value = useMemo(
    () => ({ user, loading, registering, setRegistering, refreshUser }),
    [user, loading, registering, refreshUser]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
