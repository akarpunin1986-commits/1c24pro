/**
 * Hero — personalized landing hero section.
 * Shows different content for guests, trial users, expiring users, expired users, and active subscribers.
 * Right column: animated mockup (guest), real databases (auth+has dbs), or upload CTA (auth+no dbs).
 * @see TZ section 5.3 — Hero description
 */

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Globe, Monitor, Laptop, Server, UserX, BrainCog } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { UserStatus } from "@/hooks/useAuth";

/* ── Types ───────────────────────────────────────────────────────────── */

interface DbInfo {
  id: string;
  name: string;
  db_name: string;
  config_code: string;
  config_name: string;
  status: string;
  web_url: string | null;
  rdp_url: string | null;
  size_gb: number | null;
  last_backup_at: string | null;
  created_at: string;
}

interface HeroProps {
  user?: UserStatus | null;
  databases?: DbInfo[];
  loading?: boolean;
}

/* ── Status mapping ──────────────────────────────────────────────────── */

const DB_STATUS: Record<string, { label: string; dotColor: string; textColor: string }> = {
  active: { label: "Работает", dotColor: "bg-green-500", textColor: "text-green-600" },
  preparing: { label: "Подготовка", dotColor: "bg-yellow-500", textColor: "text-yellow-600" },
  readonly: { label: "Только чтение", dotColor: "bg-orange-500", textColor: "text-orange-600" },
  blocked: { label: "Заблокирована", dotColor: "bg-red-500", textColor: "text-red-600" },
};

const DB_ICONS: Record<string, { icon: string; color: string }> = {
  bp30: { icon: "📗", color: "bg-green-100" },
  zup31: { icon: "📘", color: "bg-blue-100" },
  ut11: { icon: "📙", color: "bg-amber-100" },
  erp25: { icon: "📕", color: "bg-red-100" },
  unf18: { icon: "📒", color: "bg-lime-100" },
  ka2: { icon: "📓", color: "bg-purple-100" },
  dt: { icon: "📋", color: "bg-cyan-100" },
  med: { icon: "🏥", color: "bg-pink-100" },
  other: { icon: "📦", color: "bg-gray-100" },
};

/* ── Guest: Rotating dashboard mockup ─────────────────────────────────── */

interface MockCompany {
  name: string;
  tariff: string;
  activeUntil: string;
  dbs: { name: string; slug: string; size: string; color: string; icon: string }[];
  stats: { bases: number; basesLabel: string; users: number; usersLabel: string };
}

const COMPANIES: MockCompany[] = [
  {
    name: "ООО «Рассвет»",
    tariff: "Бизнес",
    activeUntil: "15.03.2026",
    dbs: [
      { name: "Бухгалтерия 3.0", slug: "rassvet_bp30_1", size: "0.8", color: "bg-green-100", icon: "📗" },
      { name: "ЗУП 3.1", slug: "rassvet_zup31_1", size: "1.2", color: "bg-blue-100", icon: "📘" },
      { name: "Управление торговлей 11", slug: "rassvet_ut11_1", size: "3.1", color: "bg-amber-100", icon: "📙" },
    ],
    stats: { bases: 3, basesLabel: "Базы", users: 5, usersLabel: "Пользователей" },
  },
  {
    name: "ООО «Сортсемовощ»",
    tariff: "Корпорация",
    activeUntil: "01.06.2026",
    dbs: [
      { name: "Бухгалтерия 3.0", slug: "sso_bp30_1", size: "1.5", color: "bg-green-100", icon: "📗" },
      { name: "ERP 2.5", slug: "sso_erp25_1", size: "8.4", color: "bg-red-100", icon: "📕" },
      { name: "Документооборот 3.0", slug: "sso_doc30_1", size: "2.1", color: "bg-purple-100", icon: "📓" },
      { name: "ЗУП 3.1", slug: "sso_zup31_1", size: "3.2", color: "bg-blue-100", icon: "📘" },
    ],
    stats: { bases: 4, basesLabel: "Базы", users: 12, usersLabel: "Пользователей" },
  },
  {
    name: "ИП Карпунин А.А.",
    tariff: "Старт",
    activeUntil: "20.04.2026",
    dbs: [
      { name: "Бухгалтерия 3.0", slug: "karpunin_bp30_1", size: "0.3", color: "bg-green-100", icon: "📗" },
    ],
    stats: { bases: 1, basesLabel: "База", users: 1, usersLabel: "Пользователь" },
  },
];

const ROTATION_INTERVAL = 5000;
const FADE_DURATION = 400;

const GuestMockup: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);

  const rotate = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setActiveIdx((prev) => (prev + 1) % COMPANIES.length);
      setVisible(true);
    }, FADE_DURATION);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(rotate, ROTATION_INTERVAL);
    return () => clearInterval(timer);
  }, [paused, rotate]);

  const company = COMPANIES[activeIdx];

  return (
    <div className="flex flex-1 items-center justify-center">
      <div
        className="group relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="transition-opacity duration-400 ease-in-out"
          style={{ opacity: visible ? 1 : 0, transitionDuration: `${FADE_DURATION}ms` }}
        >
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-dark">{company.name}</h3>
              <p className="text-sm text-text-muted">
                Тариф: {company.tariff} | Активен до {company.activeUntil}
              </p>
            </div>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              Всё работает
            </span>
          </div>

          {/* Database cards */}
          <div className="space-y-3">
            {company.dbs.map((db, idx) => (
              <div
                key={db.slug}
                className="flex animate-fadeInUp items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4 opacity-0 transition-all duration-200 hover:translate-x-1 hover:bg-gray-100"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${db.color} text-lg`}>
                    {db.icon}
                  </div>
                  <div>
                    <p className="font-medium text-dark">{db.name}</p>
                    <p className="text-xs text-text-muted">{db.slug} &bull; {db.size} ГБ</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-500 group-hover:animate-softPing" />
                  <span className="text-sm text-green-600">Работает</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom stats */}
          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-100 pt-4">
            <div className="text-center">
              <p className="text-4xl font-extrabold text-dark transition-transform duration-300 group-hover:scale-110">
                {company.stats.bases}
              </p>
              <p className="text-xs text-gray-400">{company.stats.basesLabel}</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-extrabold text-dark transition-transform duration-300 group-hover:scale-110">
                {company.stats.users}
              </p>
              <p className="text-xs text-gray-400">{company.stats.usersLabel}</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-extrabold text-green-600 transition-transform duration-300 group-hover:scale-110">
                99.9%
              </p>
              <p className="text-xs text-gray-400">Uptime</p>
            </div>
          </div>
        </div>

        {/* Rotation dots */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {COMPANIES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => { setActiveIdx(idx); setVisible(true); }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeIdx ? "w-6 bg-primary" : "w-1.5 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Компания ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Auth: Frozen mockup ─────────────────────────────────────────────── */

const FrozenMockup: React.FC = () => (
  <div className="flex flex-1 items-center justify-center">
    <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 opacity-60 shadow-xl">
      <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60 backdrop-blur-[2px]">
        <span className="rounded-xl bg-red-100 px-6 py-3 text-lg font-bold text-red-600">
          Заморожено
        </span>
      </div>
      {/* Simplified frozen card content */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-dark">Ваши базы</h3>
        <p className="text-sm text-text-muted">Тестовый период истёк</p>
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl border border-gray-100 bg-gray-50" />
        ))}
      </div>
    </div>
  </div>
);

/* ── Auth: Real databases panel ──────────────────────────────────────── */

const RealDashboard: React.FC<{ user: UserStatus; databases: DbInfo[] }> = ({ user, databases }) => {
  const allActive = databases.every((d) => d.status === "active");

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-dark">{user.org_name}</h3>
            <p className="text-sm text-text-muted">
              {user.status === "active"
                ? `Тариф: ${user.tariff ?? "Бизнес"}`
                : `Тестовый период | Осталось ${user.trial_days_left} ${pluralDays(user.trial_days_left)}`}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              allActive
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {allActive ? "Всё работает" : "Ожидает загрузки"}
          </span>
        </div>

        {/* Real database cards */}
        <div className="space-y-3">
          {databases.map((db, idx) => {
            const st = DB_STATUS[db.status] ?? DB_STATUS.preparing;
            const ic = DB_ICONS[db.config_code] ?? DB_ICONS.other;
            return (
              <div
                key={db.id}
                className="flex animate-fadeInUp items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4 opacity-0"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${ic.color} text-lg`}>
                    {ic.icon}
                  </div>
                  <div>
                    <p className="font-medium text-dark">{db.config_name || db.name}</p>
                    <p className="text-xs text-text-muted">
                      {db.db_name} {db.size_gb ? `\u2022 ${db.size_gb} ГБ` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${st.dotColor} ${db.status === "active" ? "animate-pulse" : ""}`} />
                  <span className={`text-sm ${st.textColor}`}>{st.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-100 pt-4">
          <div className="text-center">
            <p className="text-4xl font-extrabold text-dark">{databases.length}</p>
            <p className="text-xs text-gray-400">{databases.length === 1 ? "База" : "Базы"}</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-extrabold text-dark">&mdash;</p>
            <p className="text-xs text-gray-400">Пользователей</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-extrabold text-green-600">99.9%</p>
            <p className="text-xs text-gray-400">Uptime</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Auth: Empty state — upload invitation ───────────────────────────── */

const UploadInvitation: React.FC<{ user: UserStatus }> = ({ user }) => (
  <div className="flex flex-1 items-center justify-center">
    <Link
      to="/dashboard"
      className="group w-full max-w-lg no-underline"
    >
      <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-6 shadow-xl transition-all duration-200 hover:border-primary hover:bg-orange-50">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-dark">{user.org_name}</h3>
          <p className="text-sm text-text-muted">
            Тестовый период | Осталось {user.trial_days_left} {pluralDays(user.trial_days_left)}
          </p>
        </div>

        {/* Upload CTA */}
        <div className="flex flex-col items-center py-8 text-center">
          <div className="mb-4 text-5xl">📂</div>
          <p className="text-lg font-semibold text-gray-900">
            Загрузите свою первую базу 1С
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Поддерживаем .dt и .bak файлы любого размера
          </p>
          <div className="mt-6">
            <span className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors group-hover:bg-primary-hover">
              Загрузить базу
            </span>
          </div>
        </div>
      </div>
    </Link>
  </div>
);

/* ── Trust badges ────────────────────────────────────────────────────── */

const TrustBadges: React.FC = () => (
  <div className="flex flex-wrap items-center gap-6 pt-4 text-base text-gray-500">
    <span className="flex items-center gap-2">
      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
      </svg>
      Серверы в РФ
    </span>
    <span className="text-gray-300">|</span>
    <span className="flex items-center gap-2">
      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
      SLA 99.9%
    </span>
    <span className="text-gray-300">|</span>
    <span className="flex items-center gap-2">
      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
      </svg>
      Ежедневные бэкапы
    </span>
    <span className="text-gray-300">|</span>
    <span className="flex items-center gap-2">
      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
      Любая форма оплаты
    </span>
  </div>
);

/* ── Trial progress bar ──────────────────────────────────────────────── */

const TrialProgressBar: React.FC<{
  daysLeft: number;
  trialStartedAt?: string | null;
  trialEndsAt?: string | null;
  color?: string;
}> = ({ daysLeft, trialStartedAt, trialEndsAt, color = "bg-primary" }) => {
  const totalDays =
    trialStartedAt && trialEndsAt
      ? Math.ceil(
          (new Date(trialEndsAt).getTime() - new Date(trialStartedAt).getTime()) / 86400000,
        )
      : 30;
  const pct = Math.max(0, Math.min(100, ((totalDays - daysLeft) / totalDays) * 100));
  return (
    <div className="mt-2 h-2 w-full max-w-md overflow-hidden rounded-full bg-gray-200">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
};

/* ── Plural helper ───────────────────────────────────────────────────── */

function pluralDays(n: number): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "день";
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return "дня";
  return "дней";
}

/* ── Right-column selector ───────────────────────────────────────────── */

function RightColumn({ user, databases }: { user: UserStatus | null; databases: DbInfo[] }): React.ReactElement {
  if (!user) return <GuestMockup />;
  if (user.status === "expired") return <FrozenMockup />;
  if (databases.length > 0) return <RealDashboard user={user} databases={databases} />;
  return <UploadInvitation user={user} />;
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  Main Hero component                                                  */
/* ══════════════════════════════════════════════════════════════════════ */

export const Hero: React.FC<HeroProps> = ({ user = null, databases = [], loading = false }) => {
  /* ── Guest / loading ─────────────────────────────────────────── */
  if (loading || !user) {
    return (
      <section className="relative min-h-screen bg-bg pt-32">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-16 px-6 lg:flex-row">
          <div className="flex-1 space-y-6">
            <span className="inline-block rounded-full bg-orange-100 px-4 py-1.5 text-sm font-medium text-orange-700">
              Облачная 1С нового поколения
            </span>

            <h1 className="text-4xl font-extrabold leading-tight text-dark md:text-5xl lg:text-[56px]">
              Ваша 1С в облаке.
              <br />
              <span className="text-primary">Просто работает.</span>
            </h1>

            <div className="max-w-lg">
              {/* What you get */}
              <div className="flex flex-wrap gap-4 md:gap-6">
                <span className="flex items-center gap-1.5 text-sm text-gray-700 md:text-base">
                  <Globe className="h-[18px] w-[18px] text-green-500" /> Любой браузер
                </span>
                <span className="flex items-center gap-1.5 text-sm text-gray-700 md:text-base">
                  <Monitor className="h-[18px] w-[18px] text-green-500" /> Тонкий клиент
                </span>
                <span className="flex items-center gap-1.5 text-sm text-gray-700 md:text-base">
                  <Laptop className="h-[18px] w-[18px] text-green-500" /> Удалённый рабочий стол
                </span>
              </div>
              {/* What you lose */}
              <div className="mt-2 flex flex-wrap gap-4 md:gap-6">
                <span className="flex items-center gap-1.5 text-sm text-gray-400 line-through md:text-base">
                  <Server className="h-[18px] w-[18px] text-red-400" /> Серверы
                </span>
                <span className="flex items-center gap-1.5 text-sm text-gray-400 line-through md:text-base">
                  <UserX className="h-[18px] w-[18px] text-red-400" /> Админы
                </span>
                <span className="flex items-center gap-1.5 text-sm text-gray-400 line-through md:text-base">
                  <BrainCog className="h-[18px] w-[18px] text-red-400" /> Головная боль
                </span>
              </div>
              {/* Price */}
              <p className="mt-3 text-lg font-semibold text-gray-800">
                От 690 ₽/мес за пользователя
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/auth">
                <Button variant="primary" size="lg">
                  Попробовать бесплатно — 30 дней
                </Button>
              </Link>
              <a href="#pricing">
                <Button variant="outline" size="lg">
                  Смотреть тарифы
                </Button>
              </a>
            </div>

            <TrustBadges />
          </div>

          <GuestMockup />
        </div>
      </section>
    );
  }

  /* ── Trial not started (registered, no uploads yet) ──────────── */
  if (user.status === "trial_not_started") {
    return (
      <section className="relative bg-bg pb-16 pt-28">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 lg:flex-row">
          <div className="flex-1 space-y-4">
            <span className="inline-block rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-700">
              30 дней бесплатно
            </span>

            <h1 className="text-3xl font-bold leading-snug text-dark">
              {user.display_name ? `${user.display_name},` : ""}
              {user.display_name ? <br /> : null}
              с возвращением 👋
            </h1>

            <p className="text-base text-gray-500">
              {user.org_name} &bull; ИНН {user.org_inn}
            </p>

            <p className="text-base text-gray-600">
              <span className="font-semibold text-green-600">30 дней бесплатно</span> — начнутся после загрузки первой базы
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/dashboard">
                <Button variant="primary" size="lg">
                  Загрузить базу
                </Button>
              </Link>
              <a href="#pricing">
                <Button variant="outline" size="lg">
                  Посмотреть тарифы
                </Button>
              </a>
            </div>
          </div>

          <UploadInvitation user={user} />
        </div>
      </section>
    );
  }

  /* ── Trial active (days > 5) ─────────────────────────────────── */
  if (user.status === "trial") {
    return (
      <section className="relative bg-bg pb-16 pt-28">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 lg:flex-row">
          <div className="flex-1 space-y-4">
            <span className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
              Тестовый период
            </span>

            <h1 className="text-3xl font-bold leading-snug text-dark">
              {user.display_name ? `${user.display_name},` : ""}
              {user.display_name ? <br /> : null}
              с возвращением 👋
            </h1>

            <p className="text-base text-gray-500">
              {user.org_name} &bull; ИНН {user.org_inn}
            </p>

            <p className="text-base text-text-muted">
              Тестовый период — осталось{" "}
              <span className="font-semibold text-dark">
                {user.trial_days_left} {pluralDays(user.trial_days_left)}
              </span>
            </p>

            <TrialProgressBar
              daysLeft={user.trial_days_left}
              trialStartedAt={user.trial_started_at}
              trialEndsAt={user.trial_ends_at}
              color="bg-primary"
            />

            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/dashboard">
                <Button variant="primary" size="lg">
                  Перейти к базам
                </Button>
              </Link>
              <a href="#pricing">
                <Button variant="outline" size="lg">
                  Выбрать тариф
                </Button>
              </a>
            </div>
          </div>

          <RightColumn user={user} databases={databases} />
        </div>
      </section>
    );
  }

  /* ── Trial ending (days <= 5) ────────────────────────────────── */
  if (user.status === "trial_ending") {
    return (
      <section className="relative bg-bg pb-16 pt-28">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 lg:flex-row">
          <div className="flex-1 space-y-4">
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
              <p className="text-sm font-medium text-orange-700">
                &#x26A0;&#xFE0F; Осталось {user.trial_days_left} {pluralDays(user.trial_days_left)} тестового периода
              </p>
            </div>

            <h1 className="text-3xl font-bold leading-snug text-dark">
              {user.display_name ? `${user.display_name},` : ""}
              {user.display_name ? <br /> : null}
              ваш тестовый период заканчивается
            </h1>

            <p className="text-base text-gray-500">
              {user.org_name} &bull; ИНН {user.org_inn}
            </p>

            <p className="text-base text-orange-600">
              Осталось {user.trial_days_left} {pluralDays(user.trial_days_left)} — выберите тариф, чтобы не потерять данные
            </p>

            <TrialProgressBar
              daysLeft={user.trial_days_left}
              trialStartedAt={user.trial_started_at}
              trialEndsAt={user.trial_ends_at}
              color="bg-orange-500"
            />

            <div className="flex flex-wrap gap-3 pt-2">
              <a href="#pricing">
                <Button variant="primary" size="lg">
                  Выбрать тариф и оплатить
                </Button>
              </a>
              <Link to="/dashboard">
                <Button variant="outline" size="lg">
                  Перейти к базам
                </Button>
              </Link>
            </div>
          </div>

          <RightColumn user={user} databases={databases} />
        </div>
      </section>
    );
  }

  /* ── Expired ─────────────────────────────────────────────────── */
  if (user.status === "expired") {
    return (
      <section className="relative bg-bg pb-16 pt-28">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 lg:flex-row">
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold leading-snug text-dark">
              {user.display_name ? `${user.display_name},` : ""}
              {user.display_name ? <br /> : null}
              ваши базы <span className="text-red-500">заморожены</span>
            </h1>

            <p className="text-base text-gray-500">
              {user.org_name} &bull; ИНН {user.org_inn}
            </p>

            <p className="text-base text-text-muted">
              Оплатите тариф, чтобы продолжить работу.
              <br />
              Данные хранятся ещё 30 дней.
            </p>

            <div className="pt-2">
              <a href="#pricing">
                <Button variant="primary" size="lg">
                  Выбрать тариф и оплатить
                </Button>
              </a>
            </div>
          </div>

          <FrozenMockup />
        </div>
      </section>
    );
  }

  /* ── Active subscription ─────────────────────────────────────── */
  return (
    <section className="relative bg-bg pb-16 pt-28">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 lg:flex-row">
        <div className="flex-1 space-y-4">
          <span className="inline-block rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-700">
            Активная подписка
          </span>

          <h1 className="text-3xl font-bold leading-snug text-dark">
            {user.display_name ? `${user.display_name},` : ""}
            {user.display_name ? <br /> : null}
            с возвращением 👋
          </h1>

          <p className="text-base text-gray-500">
            {user.org_name} &bull; ИНН {user.org_inn}
          </p>

          <p className="text-base text-text-muted">
            Тариф {user.tariff ?? "Бизнес"}
            {user.tariff_active_until
              ? ` — активен до ${new Date(user.tariff_active_until).toLocaleDateString("ru-RU")}`
              : " — активен"}
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/dashboard">
              <Button variant="primary" size="lg">
                Перейти к базам
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" size="lg">
                Управление подпиской
              </Button>
            </Link>
          </div>
        </div>

        <RightColumn user={user} databases={databases} />
      </div>
    </section>
  );
};
