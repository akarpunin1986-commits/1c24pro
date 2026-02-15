/**
 * Validation utility functions for form inputs.
 */

/**
 * Validate a Russian INN (10 digits for legal, 12 for individual).
 * Checks format and control digit(s) according to Russian tax rules.
 * @param inn - INN string
 * @returns Whether the INN is valid
 */
export function validateINN(inn: string): boolean {
  if (!/^\d{10}$|^\d{12}$/.test(inn)) return false;

  const digits = inn.split("").map(Number);

  if (digits.length === 10) {
    const weights = [2, 4, 10, 3, 5, 9, 4, 6, 8];
    const sum = weights.reduce((acc, w, i) => acc + w * (digits[i] ?? 0), 0);
    return (sum % 11) % 10 === digits[9];
  }

  if (digits.length === 12) {
    const weights11 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
    const sum11 = weights11.reduce((acc, w, i) => acc + w * (digits[i] ?? 0), 0);
    const check11 = (sum11 % 11) % 10 === digits[10];

    const weights12 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
    const sum12 = weights12.reduce((acc, w, i) => acc + w * (digits[i] ?? 0), 0);
    const check12 = (sum12 % 11) % 10 === digits[11];

    return check11 && check12;
  }

  return false;
}

/**
 * Check if a string looks like a valid INN format (just digits, correct length).
 * Less strict than validateINN — doesn't check control digits.
 * @param inn - INN string
 * @returns Whether the format is correct
 */
export function isINNFormat(inn: string): boolean {
  return /^\d{10}$|^\d{12}$/.test(inn);
}

/**
 * Validate a Russian phone number.
 * @param phone - Phone number string
 * @returns Whether the phone number is valid
 */
export function validatePhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return (
    (digits.startsWith("7") || digits.startsWith("8")) &&
    digits.length === 11
  );
}

/**
 * Validate an email address.
 * @param email - Email string
 * @returns Whether the email is valid
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate a 6-digit OTP code.
 * @param code - OTP code string
 * @returns Whether the code is valid format
 */
export function validateOTPCode(code: string): boolean {
  return /^\d{6}$/.test(code);
}

/**
 * Validate file extension for upload.
 * @param filename - Filename to check
 * @returns Whether the file extension is allowed (.dt or .bak)
 */
export function validateFileExtension(filename: string): boolean {
  const lower = filename.toLowerCase();
  return lower.endsWith(".dt") || lower.endsWith(".bak");
}

/**
 * Validate file size for upload.
 * @param sizeBytes - File size in bytes
 * @param maxBytes - Maximum allowed size. Default: 50 GB
 * @returns Whether the file is within size limits
 */
export function validateFileSize(
  sizeBytes: number,
  maxBytes: number = 50 * 1024 * 1024 * 1024,
): boolean {
  return sizeBytes > 0 && sizeBytes <= maxBytes;
}
