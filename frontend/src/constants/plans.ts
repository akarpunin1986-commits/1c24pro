/**
 * Pricing plans, discounts and configurations from TZ section 5.4.
 * All prices are per user per month in RUB.
 */

import type { Plan, PrepayDiscount, VolumeDiscount, ConfigOption } from "@/types/common";

/** Available pricing plans */
export const PLANS: readonly Plan[] = [
  {
    id: "start",
    name: "Старт",
    price: 890,
    minUsers: 1,
    basesIncluded: 1,
    extraBase: 500,
    disk: 10,
    diskOverage: 5,
    support: "Email, чат",
    reaction: "<4ч",
  },
  {
    id: "business",
    name: "Бизнес",
    price: 790,
    minUsers: 5,
    basesIncluded: 3,
    extraBase: 400,
    disk: 20,
    diskOverage: 4,
    support: "Email, чат, тел",
    reaction: "<2ч",
    popular: true,
  },
  {
    id: "corp",
    name: "Корпорация",
    price: 690,
    minUsers: 15,
    basesIncluded: 10,
    extraBase: 300,
    disk: 50,
    diskOverage: 3,
    support: "Перс. менеджер",
    reaction: "<1ч",
  },
] as const;

/** Prepayment discounts by period length */
export const PREPAY_DISCOUNTS: readonly PrepayDiscount[] = [
  { months: 1, discount: 0, label: "1 мес" },
  { months: 3, discount: 0.05, label: "3 мес (−5%)" },
  { months: 6, discount: 0.1, label: "6 мес (−10%)" },
  { months: 12, discount: 0.15, label: "12 мес (−15%)" },
] as const;

/** Volume discount tiers (by number of users) */
export const VOLUME_DISCOUNTS: readonly VolumeDiscount[] = [
  { min: 1, discount: 0 },
  { min: 5, discount: 0.05 },
  { min: 10, discount: 0.1 },
  { min: 20, discount: 0.15 },
] as const;

/** Maximum combined discount (prepay + volume) */
export const MAX_COMBINED_DISCOUNT = 0.28;

/** Trial period in days */
export const TRIAL_DAYS = 30;

/** Read-only period after trial ends (days) */
export const READONLY_DAYS = 7;

/** Storage period after block (days) */
export const STORAGE_DAYS = 30;

/** Maximum trial users */
export const TRIAL_MAX_USERS = 3;

/** Available 1C configurations */
export const CONFIGURATIONS: readonly ConfigOption[] = [
  { code: "bp30", name: "Бухгалтерия предприятия 3.0", shortName: "Бухгалтерия 3.0" },
  { code: "bp_corp", name: "Бухгалтерия предприятия КОРП", shortName: "Бухгалтерия КОРП" },
  { code: "zup31", name: "Зарплата и управление персоналом 3.1", shortName: "ЗУП 3.1" },
  { code: "zup_corp", name: "ЗУП КОРП", shortName: "ЗУП КОРП" },
  { code: "ut11", name: "Управление торговлей 11", shortName: "УТ 11" },
  { code: "ka2", name: "Комплексная автоматизация 2", shortName: "КА 2" },
  { code: "erp25", name: "1С:ERP 2.5", shortName: "ERP 2.5" },
  { code: "unf3", name: "Управление нашей фирмой 3", shortName: "УНФ 3" },
  { code: "do3", name: "Документооборот 3", shortName: "ДО 3" },
  { code: "roz2", name: "Розница 2", shortName: "Розница 2" },
  { code: "med", name: "Медицина", shortName: "Медицина" },
  { code: "custom", name: "Нетиповая конфигурация", shortName: "Другая" },
] as const;

/** Maximum upload size in bytes (50 GB) */
export const MAX_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024 * 1024;

/** Chunk size for uploads in bytes (5 MB) */
export const CHUNK_SIZE_BYTES = 5 * 1024 * 1024;

/** Allowed upload file extensions */
export const ALLOWED_EXTENSIONS = [".dt", ".bak"] as const;
