// Verbatim constants synchronized with firebase-blueprint.json & firestore.rules
export const ID_REGEX_PATTERN = '^[a-zA-Z0-9_\\-]+$';
export const ID_REGEX = new RegExp(ID_REGEX_PATTERN);
export const MAX_ID_LENGTH = 128;

export const MAX_OWNER_NAME = 50;
export const MAX_STORE_NAME = 45;
export const MAX_EMAIL = 60;
export const PHONE_DIGITS_LENGTH = 11;
export const MAX_PHONE_FORMATTED = 20;
export const MAX_CITY = 80;
export const MAX_SEGMENT = 60;
export const MAX_PLAN = 40;
export const MAX_PIX_KEY = 80;
export const MIN_PASSWORD = 4;
export const MAX_PASSWORD = 40;
export const MAX_BLOCK_REASON = 200;
export const MAX_DATE_LABEL = 30;

export const MAX_PRODUCT_NAME = 60;
export const MAX_PRODUCT_UNIT = 35;
export const MAX_PRODUCT_DESC = 500;
export const MAX_PRODUCT_TAG = 30;
export const MAX_PRODUCT_EMOJI = 16;
export const MAX_PRODUCT_IMAGE_URL = 400000;

export const MAX_ORDER_NUMBER = 20;
export const MAX_CUSTOMER_NAME = 80;
export const MAX_CUSTOMER_PHONE = 25;
export const MAX_CUSTOMER_INITIALS = 4;
export const MAX_DELIVERY_DATE = 60;
export const MAX_ORDER_NOTES = 500;
export const MAX_ISO_DATE = 40;

export const MAX_CUSTOMER_EMAIL = 80;
export const MAX_CUSTOMER_ADDRESS = 200;
export const MAX_CUSTOMER_NOTES = 500;
export const MAX_CUSTOMER_FAVORITE = 80;

export function sanitizeId(raw: string, fallbackPrefix = 'item'): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, MAX_ID_LENGTH);
  if (!cleaned || !ID_REGEX.test(cleaned)) {
    return `${fallbackPrefix}-${Date.now()}`;
  }
  return cleaned;
}

export function clampText(value: string | undefined | null, maxLength: number, fallback = ''): string {
  const trimmed = (value ?? '').trim();
  const base = trimmed.length > 0 ? trimmed : fallback;
  return base.slice(0, maxLength);
}

export function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

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
