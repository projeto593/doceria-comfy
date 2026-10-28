export const MAX_OWNER_NAME = 50;
export const MAX_STORE_NAME = 45;
export const MAX_EMAIL = 60;
export const PHONE_DIGITS_LENGTH = 11;

export function extractPhoneDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, PHONE_DIGITS_LENGTH);
}

export function formatPhone11(value: string): string {
  const digits = extractPhoneDigits(value);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function sanitizeOwnerName(value: string): string {
  return value.slice(0, MAX_OWNER_NAME);
}

export function sanitizeStoreName(value: string): string {
  return value.slice(0, MAX_STORE_NAME);
}

export function sanitizeEmail(value: string): string {
  return value.replace(/\s/g, '').slice(0, MAX_EMAIL);
}
