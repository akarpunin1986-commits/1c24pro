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
            Загрузите свою базу 1С и работайте из любого браузера. Без серверов, без админов, без
            головной боли. От 690 ₽/мес за пользователя.
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

          {/* Trust badges */}
          <div className="flex flex-wrap gap-4 pt-4">
            {[
              "Серверы в РФ",
              "SLA 99.9%",
              "Ежедневные бэкапы",
              "Оплата по РФ",
            ].map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-border-light bg-white px-3 py-1.5 text-xs font-medium text-text-muted"
              >
                {badge}
              </span>
            ))}
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
