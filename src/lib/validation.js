// Shared form rules. Each returns an error message, or undefined when the value is valid.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_MIN = 8;

export function validateEmail(email, t) {
  if (!email.trim()) return t('Email is required.', 'البريد الإلكتروني مطلوب.');
  if (!EMAIL_RE.test(email.trim())) return t('Enter a valid email address, like name@team.dev', 'أدخل بريدًا إلكترونيًا صحيحًا، مثل name@team.dev');
}

export function validatePassword(password, t, { checkLength = true } = {}) {
  if (!password) return t('Password is required.', 'كلمة المرور مطلوبة.');
  if (checkLength && password.length < PASSWORD_MIN) {
    return t(`Password must be at least ${PASSWORD_MIN} characters`, `يجب أن تتكون كلمة المرور من ${PASSWORD_MIN} أحرف على الأقل`);
  }
}

export function validateName(name, t) {
  const n = name.trim();
  if (!n) return t('Name is required.', 'الاسم مطلوب.');
  if (n.length < 2) return t('Name needs at least 2 characters', 'يجب أن يتكون الاسم من حرفين على الأقل');
  if (n.length > 60) return t('Name can be at most 60 characters', 'يجب ألا يتجاوز الاسم 60 حرفًا');
}

export const PROJECT_NAME = { min: 3, max: 80 };
export const DESCRIPTION_MAX = 1000;

export function validateProjectName(name, t) {
  const n = name.trim();
  if (!n) return t('Project name is required.', 'اسم المشروع مطلوب.');
  if (n.length < PROJECT_NAME.min) return t(`Name needs at least ${PROJECT_NAME.min} characters`, `يجب أن يتكون الاسم من ${PROJECT_NAME.min} أحرف على الأقل`);
  if (n.length > PROJECT_NAME.max) return t(`Name can be at most ${PROJECT_NAME.max} characters`, `يجب ألا يتجاوز الاسم ${PROJECT_NAME.max} حرفًا`);
}

export function validateDescription(description, t) {
  if (description.trim().length > DESCRIPTION_MAX) {
    return t(`Description can be at most ${DESCRIPTION_MAX} characters`, `يجب ألا يتجاوز الوصف ${DESCRIPTION_MAX} حرف`);
  }
}

/** Drops undefined entries so `Object.keys(errors).length` means "has errors". */
export const compact = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v));
