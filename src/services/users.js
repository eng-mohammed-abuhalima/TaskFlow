import {
  createUserWithEmailAndPassword,
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

export function loginUser({ email, password }) {
  return signInWithEmailAndPassword(auth, normalizeEmail(email), password);
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
    case 'auth/too-many-requests':
      return t('Too many attempts. Wait a moment and try again.', 'محاولات كثيرة. انتظر قليلًا ثم حاول مجددًا.');
    case 'auth/network-request-failed':
      return t('No connection. Check your internet and try again.', 'لا يوجد اتصال. تحقق من الإنترنت وحاول مجددًا.');
    default:
      return t('Something went wrong. Please try again.', 'حدث خطأ ما. حاول مجددًا.');
  }
}
