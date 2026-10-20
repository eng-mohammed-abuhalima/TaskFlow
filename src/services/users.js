import {
  browserSessionPersistence,
  indexedDBLocalPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithPopup,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { auth, db } from '../lib/firebase.js';

export const normalizeEmail = (email) => email.trim().toLowerCase();

/**
 * Creates the Auth account, then the public profile and the email lookup in one batch.
 * The password only ever goes to Firebase Auth, never to Firestore.
 */
export async function registerUser({ name, email, password }) {
  const displayName = name.trim();
  const emailLower = normalizeEmail(email);
  const { user } = await createUserWithEmailAndPassword(auth, emailLower, password);
  await updateProfile(user, { displayName });

  const batch = writeBatch(db);
  batch.set(doc(db, 'users', user.uid), { displayName, email: emailLower, createdAt: serverTimestamp() });
  // The lookup carries the name too, so an owner adding this person by email can show who they are
  // without being able to read the private users/{uid} document.
  batch.set(doc(db, 'userEmails', emailLower), { uid: user.uid, displayName });
  await batch.commit();
  return user;
}

/** Who owns this email? { uid, displayName } or null when no account uses it. */
export async function findUserByEmail(email) {
  const snap = await getDoc(doc(db, 'userEmails', normalizeEmail(email)));
  if (!snap.exists()) return null;
  const { uid, displayName } = snap.data();
  return { uid, displayName: displayName || normalizeEmail(email).split('@')[0] };
}

/**
 * remember = true keeps the session after the browser is closed (IndexedDB, Firebase's default);
 * false keeps it only for this tab, so closing the tab signs the user out.
 */
export async function loginUser({ email, password, remember = true }) {
  await setPersistence(auth, remember ? indexedDBLocalPersistence : browserSessionPersistence);
  return signInWithEmailAndPassword(auth, normalizeEmail(email), password);
}

// The rules accept names of 2-60 characters. A Google account may have no name, or a longer one.
function profileName(name, email) {
  const fromAccount = (name || '').trim();
  const fallback = email.split('@')[0];
  const picked = fromAccount.length >= 2 ? fromAccount : fallback.length >= 2 ? fallback : 'TaskFlow user';
  return picked.slice(0, 60).trim();
}

/**
 * First sign-in with Google: write the same profile + email lookup that registerUser writes.
 * Returning users already have them, so for them this is a single read.
 */
async function ensureProfile(user) {
  const profileRef = doc(db, 'users', user.uid);
  if ((await getDoc(profileRef)).exists()) return;

  const emailLower = normalizeEmail(user.email || '');
  const displayName = profileName(user.displayName, emailLower);
  if (user.displayName !== displayName) await updateProfile(user, { displayName });

  const batch = writeBatch(db);
  batch.set(profileRef, { displayName, email: emailLower, createdAt: serverTimestamp() });
  batch.set(doc(db, 'userEmails', emailLower), { uid: user.uid, displayName });
  await batch.commit();
}

/**
 * Google sign-in in a popup, for new and returning users. A new user gets a profile before this
 * resolves (the caller holds `registering`, so the redirect waits for it). If the profile can't be
 * written, the user is signed out again instead of being left half set up.
 */
export async function signInWithGoogle({ remember = true } = {}) {
  await setPersistence(auth, remember ? indexedDBLocalPersistence : browserSessionPersistence);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const { user } = await signInWithPopup(auth, provider);
  try {
    await ensureProfile(user);
  } catch (err) {
    await signOut(auth);
    throw err;
  }
  return user;
}

/** The user closed the Google popup: nothing to report. */
export const isPopupDismissed = (error) =>
  error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request';

/**
 * Sends Firebase's reset link, in the UI language. After choosing a new password the user gets a
 * "Continue" button back to our sign-in page. With email enumeration protection on (the default),
 * an unknown email succeeds too, so the page must never say whether the account exists.
 */
export function sendPasswordReset(email, lang) {
  auth.languageCode = lang;
  return sendPasswordResetEmail(auth, normalizeEmail(email), { url: `${window.location.origin}/login` });
}

export function logoutUser() {
  return signOut(auth);
}

/** Maps Firebase error codes to a bilingual message. Unknown codes get a generic one. */
export function authErrorMessage(error, t) {
  switch (error?.code) {
    case 'auth/email-already-in-use':
      return t('An account with this email already exists.', 'يوجد حساب بهذا البريد الإلكتروني.');
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return t('Email or password is incorrect.', 'البريد الإلكتروني أو كلمة المرور غير صحيحة.');
    case 'auth/invalid-email':
      return t('Enter a valid email address.', 'أدخل بريدًا إلكترونيًا صحيحًا.');
    case 'auth/weak-password':
      return t('Password is too weak.', 'كلمة المرور ضعيفة.');
    case 'auth/popup-blocked':
      return t('The browser blocked the Google window. Allow pop-ups for this site and try again.', 'حظر المتصفح نافذة Google. اسمح بالنوافذ المنبثقة لهذا الموقع وحاول مجددًا.');
    case 'auth/operation-not-allowed':
      return t('Google sign-in isn\'t turned on for this app yet.', 'تسجيل الدخول عبر Google غير مفعّل لهذا التطبيق بعد.');
    case 'auth/unauthorized-domain':
      return t('Google sign-in isn\'t allowed on this address.', 'تسجيل الدخول عبر Google غير مسموح على هذا العنوان.');
    case 'auth/account-exists-with-different-credential':
      return t('This email already has an account. Sign in with your password.', 'هذا البريد مسجّل بالفعل. سجّل الدخول بكلمة المرور.');
    case 'auth/missing-email':
      return t('Email is required.', 'البريد الإلكتروني مطلوب.');
    case 'auth/too-many-requests':
      return t('Too many attempts. Wait a moment and try again.', 'محاولات كثيرة. انتظر قليلًا ثم حاول مجددًا.');
    case 'auth/network-request-failed':
      return t('No connection. Check your internet and try again.', 'لا يوجد اتصال. تحقق من الإنترنت وحاول مجددًا.');
    default: {
      // Unexpected: keep the code visible (and in the console) so it can be reported and traced.
      console.error('Auth flow failed:', error);
      const code = error?.code ? ` (${error.code})` : '';
      return t(`Something went wrong${code}. Please try again.`, `حدث خطأ ما${code}. حاول مجددًا.`);
    }
  }
}
