/**
 * Hero — fullscreen landing hero section.
 * Left: badge, headline, description, 2 CTA buttons, trust badges.
 * Right: dashboard mockup placeholder.
 * @see TZ section 5.3 — Hero description
 */

import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface HeroProps extends Record<string, never> {}

/** Landing page hero section */
export const Hero: React.FC<HeroProps> = () => {
  return (
    <section className="relative min-h-screen bg-bg pt-32">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-16 px-6 lg:flex-row">
        {/* Left content */}
        <div className="flex-1 space-y-6">
          <Badge variant="orange">Облачная 1С нового поколения</Badge>

          <h1 className="text-4xl font-extrabold leading-tight text-dark md:text-5xl lg:text-[56px]">
            Ваша 1С в облаке.
            <br />
            <span className="text-primary">Просто работает.</span>
          </h1>

          <p className="max-w-lg text-lg text-text-muted">
            Загрузите свою базу 1С и работайте из любого браузера, тонкого клиента или удалённого
            рабочего стола Windows. Без серверов, без админов, без головной боли. От 690 ₽/мес за
            пользователя.
          </p>

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

          {/* Trust Badges */}
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
              Любая оплата
            </span>
          </div>
        </div>

        {/* Dashboard mockup */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-dark">ООО «Рассвет»</h3>
                <p className="text-sm text-text-muted">Тариф: Бизнес | Активен до 15.03.2026</p>
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                Всё работает
              </span>
            </div>

            {/* Database cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-lg">
                    📗
                  </div>
                  <div>
                    <p className="font-medium text-dark">Бухгалтерия 3.0</p>
                    <p className="text-xs text-text-muted">rassvet_bp30_1 • 2.4 ГБ</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm text-green-600">Работает</span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-lg">
                    📘
                  </div>
                  <div>
                    <p className="font-medium text-dark">ЗУП 3.1</p>
                    <p className="text-xs text-text-muted">rassvet_zup31_1 • 1.8 ГБ</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm text-green-600">Работает</span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-lg">
                    📙
                  </div>
                  <div>
                    <p className="font-medium text-dark">Управление торговлей 11</p>
                    <p className="text-xs text-text-muted">rassvet_ut11_1 • 5.1 ГБ</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm text-green-600">Работает</span>
                </div>
              </div>
            </div>

            {/* Bottom stats */}
            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-100 pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-dark">3</p>
                <p className="text-xs text-text-muted">Базы</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-dark">5</p>
                <p className="text-xs text-text-muted">Пользователей</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">99.9%</p>
                <p className="text-xs text-text-muted">Uptime</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
