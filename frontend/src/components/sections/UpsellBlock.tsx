/**
 * UpsellBlock — upsell comparison for paid users on Start or Business tariff.
 * Shows side-by-side comparison of current vs next tariff tier.
 */

import { Link } from "react-router-dom";

interface UpsellProps {
  currentTariff: "start" | "business";
}

interface ComparisonRow {
  label: string;
  current: string;
  next: string;
}

const DATA: Record<"start" | "business", {
  title: string;
  nextName: string;
  nextPrice: string;
  rows: ComparisonRow[];
}> = {
  start: {
    title: "Получите больше с тарифом Бизнес",
    nextName: "Бизнес",
    nextPrice: "12 990 ₽/мес",
    rows: [
      { label: "Пользователи", current: "5", next: "25" },
      { label: "Базы данных", current: "3", next: "10" },
      { label: "Поддержка", current: "Стандартная", next: "Приоритетная" },
      { label: "Ежедневные бэкапы", current: "—", next: "✓" },
      { label: "API доступ", current: "—", next: "✓" },
    ],
  },
  business: {
    title: "Масштабируйтесь с тарифом Корпорация",
    nextName: "Корпорация",
    nextPrice: "от 34 990 ₽/мес",
    rows: [
      { label: "Пользователи", current: "25", next: "Без ограничений" },
      { label: "Базы данных", current: "10", next: "Без ограничений" },
      { label: "Инфраструктура", current: "Общий кластер", next: "Выделенный сервер" },
      { label: "SLA", current: "99.9%", next: "99.99%" },
      { label: "Персональный менеджер", current: "—", next: "✓" },
    ],
  },
};

export const UpsellBlock: React.FC<UpsellProps> = ({ currentTariff }) => {
  const d = DATA[currentTariff];
  const currentName = currentTariff === "start" ? "Старт" : "Бизнес";

  return (
    <section className="py-16">
      <div className="mx-auto max-w-3xl px-6">
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 to-orange-50 p-8">
          <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
            {d.title}
          </h2>

          {/* Comparison table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {/* Header */}
            <div className="grid grid-cols-3 border-b border-gray-200 bg-gray-50 px-6 py-3">
              <div className="text-sm font-medium text-gray-500" />
              <div className="text-center text-sm font-semibold text-gray-400">
                У вас: {currentName}
              </div>
              <div className="text-center text-sm font-semibold text-gray-900">
                {d.nextName}
              </div>
            </div>

            {/* Rows */}
            {d.rows.map((row, idx) => (
              <div
                key={row.label}
                className={`grid grid-cols-3 px-6 py-3 ${idx < d.rows.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <div className="text-sm font-medium text-gray-700">{row.label}</div>
                <div className="text-center text-sm text-gray-400">{row.current}</div>
                <div className="text-center text-sm font-medium text-gray-900">
                  {row.next === "✓" ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    row.next
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-6 text-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Перейти на {d.nextName} за {d.nextPrice}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
