/**
 * Common shared types used across the application.
 */

/** Configuration code for 1C databases */
export type ConfigCode =
  | "bp30"
  | "bp_corp"
  | "zup31"
  | "zup_corp"
  | "ut11"
  | "ka2"
  | "erp25"
  | "unf3"
  | "do3"
  | "roz2"
  | "med"
  | "custom";

/** Configuration entry for the upload form */
export interface ConfigOption {
  code: ConfigCode;
  name: string;
  shortName: string;
}

/** Plan details for the pricing section */
export interface Plan {
  id: "start" | "business" | "corp";
  name: string;
  price: number;
  minUsers: number;
  basesIncluded: number;
  extraBase: number;
  disk: number;
  diskOverage: number;
  support: string;
  reaction: string;
  popular?: boolean;
}

/** Prepay discount entry */
export interface PrepayDiscount {
  months: number;
  discount: number;
  label: string;
}

/** Volume discount tier */
export interface VolumeDiscount {
  min: number;
  discount: number;
}

/** FAQ item */
export interface FAQItem {
  question: string;
  answer: string;
}

/** Big number stat for the landing page */
export interface BigNumberStat {
  value: number;
  suffix: string;
  label: string;
  prefix?: string;
}

/** Feature card for the landing page */
export interface FeatureCard {
  number: string;
  title: string;
  description: string;
  color: "orange" | "blue" | "purple" | "pink" | "green";
  items: string[];
}

/** Auth flow step */
export type AuthStep = "phone" | "otp" | "registration" | "invite";

/** Navbar link */
export interface NavLink {
  label: string;
  href: string;
}

/** API error response shape */
export interface ApiError {
  detail: string;
  status_code: number;
}

/** Generic paginated response wrapper */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
}
