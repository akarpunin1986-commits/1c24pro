/**
 * Formatting utility functions for display in the UI.
 */

/**
 * Format a phone number for display: +7 (999) 123-45-67
 * @param phone - Raw phone string (e.g. "+79991234567" or "79991234567")
 * @returns Formatted phone string
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("8") ? `7${digits.slice(1)}` : digits;

  if (normalized.length !== 11) return phone;

  const code = normalized.slice(1, 4);
  const part1 = normalized.slice(4, 7);
  const part2 = normalized.slice(7, 9);
  const part3 = normalized.slice(9, 11);

  return `+7 (${code}) ${part1}-${part2}-${part3}`;
}

/**
 * Mask a phone number for privacy: +7 (***) ***-45-67
 * @param phone - Raw or formatted phone string
 * @returns Masked phone string
 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 11) return phone;

  const lastFour = digits.slice(-4);
  const part2 = lastFour.slice(0, 2);
  const part3 = lastFour.slice(2, 4);

  return `+7 (***) ***-${part2}-${part3}`;
}

/**
 * Normalize a phone number to +7XXXXXXXXXX format.
 * @param phone - Phone string in any format
 * @returns Normalized phone string
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("8") && digits.length === 11) {
    return `+7${digits.slice(1)}`;
  }
  if (digits.startsWith("7") && digits.length === 11) {
    return `+${digits}`;
  }
  if (digits.length === 10) {
    return `+7${digits}`;
  }
  return phone;
}

/**
 * Format a price in rubles with proper separators.
 * @param amount - Numeric amount
 * @param showCurrency - Whether to append ₽ symbol. Default: true
 * @returns Formatted price string (e.g. "1 290 ₽")
 */
export function formatPrice(amount: number, showCurrency = true): string {
  const formatted = new Intl.NumberFormat("ru-RU").format(Math.round(amount));
  return showCurrency ? `${formatted} ₽` : formatted;
}

/**
 * Format file size in human-readable format.
 * @param bytes - Size in bytes
 * @returns Formatted size string (e.g. "2.4 ГБ")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Б";

  const units = ["Б", "КБ", "МБ", "ГБ", "ТБ"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const unitIndex = Math.min(i, units.length - 1);
  const size = bytes / Math.pow(k, unitIndex);
  const unit = units[unitIndex];

  if (!unit) return `${bytes} Б`;
  return `${size.toFixed(size >= 10 ? 0 : 1)} ${unit}`;
}

/**
 * Format a date string for Russian locale display.
 * @param dateStr - ISO date string
 * @returns Formatted date (e.g. "15.02.2026")
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Format a datetime string for Russian locale display.
 * @param dateStr - ISO datetime string
 * @returns Formatted datetime (e.g. "15.02.2026 19:30")
 */
export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format a discount percentage for display.
 * @param discount - Decimal discount value (e.g. 0.15 for 15%)
 * @returns Formatted discount string (e.g. "−15%")
 */
export function formatDiscount(discount: number): string {
  if (discount <= 0) return "";
  return `−${Math.round(discount * 100)}%`;
}

/**
 * Pluralize a Russian word based on count.
 * @param count - Number to base pluralization on
 * @param forms - [one, few, many] forms (e.g. ["день", "дня", "дней"])
 * @returns Correct plural form
 */
export function pluralize(count: number, forms: [string, string, string]): string {
  const absCount = Math.abs(count);
  const mod10 = absCount % 10;
  const mod100 = absCount % 100;

  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}
