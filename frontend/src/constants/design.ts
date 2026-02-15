/**
 * Design system constants from TZ section 5.2.
 * Style: Clean SaaS (Notion/Linear) + visual power (SpaceX/Tesla).
 */

/** Brand color palette */
export const COLORS = {
  primary: "#F97316",
  primaryHover: "#EA580C",
  dark: "#1C1917",
  darkHover: "#292524",
  bg: "#FAFAF8",
  bgGray: "#F5F5F5",
  textMuted: "#78716C",
  textLight: "#A8A29E",
  border: "#E7E5E4",
  borderLight: "#F3F2F0",
  success: "#16A34A",
  blue: "#3B82F6",
  purple: "#8B5CF6",
  pink: "#EC4899",
} as const;

/** Typography scale */
export const TYPOGRAPHY = {
  h1: { size: "56px", weight: 800 },
  h2: { size: "42px", weight: 800 },
  h3: { size: "28px", weight: 700 },
  body: { size: "15px", weight: 400 },
  bodyLg: { size: "18px", weight: 400 },
  caption: { size: "13px", weight: 500 },
} as const;

/** Border radius tokens */
export const RADII = {
  button: "10px",
  card: "16px",
  cardLg: "20px",
  input: "10px",
  badge: "8px",
} as const;

/** Animation config for scroll-reveal effects */
export const ANIMATION = {
  /** Default transition duration in ms */
  duration: 600,
  /** Stagger delay between items in ms */
  stagger: 100,
  /** Initial Y offset for reveal animation */
  offsetY: 20,
  /** Easing curve */
  easing: "cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

/** Responsive breakpoints (matches Tailwind defaults) */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

/** Navbar links */
export const NAV_LINKS = [
  { label: "Возможности", href: "#features" },
  { label: "Тарифы", href: "#pricing" },
  { label: "Калькулятор", href: "#calculator" },
  { label: "FAQ", href: "#faq" },
] as const;

/** TopBar partner program text */
export const TOP_BAR_TEXT =
  "Партнёрская программа: 10% с каждого клиента — на весь срок договора" as const;
export const TOP_BAR_CTA = "Подробнее" as const;

/** Database status labels and colors */
export const DATABASE_STATUS_CONFIG = {
  preparing: { label: "Разворачиваем", color: "yellow" },
  active: { label: "Работает", color: "green" },
  readonly: { label: "Только чтение", color: "orange" },
  blocked: { label: "Заблокирована", color: "red" },
  deleted: { label: "Удалена", color: "gray" },
} as const;

/** Upload status labels */
export const UPLOAD_STATUS_CONFIG = {
  pending: { label: "Ожидание", color: "gray" },
  uploading: { label: "Загрузка", color: "blue" },
  uploaded: { label: "Загружено", color: "green" },
  processing: { label: "Обработка", color: "yellow" },
  error: { label: "Ошибка", color: "red" },
} as const;
