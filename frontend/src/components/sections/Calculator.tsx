/**
 * Calculator — interactive pricing calculator with sliders.
 * Users select number of users, databases, and period to see total price.
 * @see TZ section 5.3 — Calculator description
 */

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { PLANS, PREPAY_DISCOUNTS, VOLUME_DISCOUNTS, MAX_COMBINED_DISCOUNT } from "@/constants/plans";
import { formatPrice, formatDiscount } from "@/utils/formatters";

interface CalculatorProps extends Record<string, never> {}

/**
 * Get the volume discount for a given number of users.
 */
function getVolumeDiscount(users: number): number {
  let discount = 0;
  for (const tier of VOLUME_DISCOUNTS) {
    if (users >= tier.min) {
      discount = tier.discount;
    }
  }
  return discount;
}

/**
 * Auto-select the best plan for a given number of users.
 */
function autoSelectPlan(users: number): (typeof PLANS)[number] {
  const reversed = [...PLANS].reverse();
  for (const plan of reversed) {
    if (users >= plan.minUsers) {
      return plan;
    }
  }
  return PLANS[0]!;
}

/** Interactive pricing calculator section */
export const Calculator: React.FC<CalculatorProps> = () => {
  const [users, setUsers] = useState(5);
  const [periodIndex, setPeriodIndex] = useState(0);

  const calculation = useMemo(() => {
    const plan = autoSelectPlan(users);
    const prepayDiscount = PREPAY_DISCOUNTS[periodIndex]?.discount ?? 0;
    const volumeDiscount = getVolumeDiscount(users);
    const totalDiscount = Math.min(prepayDiscount + volumeDiscount, MAX_COMBINED_DISCOUNT);
    const pricePerUser = Math.round(plan.price * (1 - totalDiscount));
    const months = PREPAY_DISCOUNTS[periodIndex]?.months ?? 1;
    const totalMonthly = pricePerUser * users;
    const totalPayment = totalMonthly * months;

    return {
      plan,
      pricePerUser,
      totalMonthly,
      totalPayment,
      totalDiscount,
      months,
    };
  }, [users, periodIndex]);

  return (
    <section id="calculator" className="bg-bg py-20">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="mb-12 text-center text-3xl font-bold text-dark">
          Калькулятор
        </h2>

        <Card padding="lg">
          {/* Users slider */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-dark">Пользователи</label>
              <span className="text-sm font-bold text-primary">{users}</span>
            </div>
            <input
              type="range"
              min={1}
              max={50}
              value={users}
              onChange={(e) => {
                setUsers(Number(e.target.value));
              }}
              className="mt-2 w-full accent-primary"
            />
          </div>

          {/* Period buttons */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-dark">Период оплаты</label>
            <div className="flex flex-wrap gap-2">
              {PREPAY_DISCOUNTS.map((period, index) => (
                <button
                  key={period.months}
                  type="button"
                  onClick={() => {
                    setPeriodIndex(index);
                  }}
                  className={`rounded-button px-4 py-2 text-sm font-medium transition-colors ${
                    periodIndex === index
                      ? "bg-dark text-white"
                      : "border border-border bg-white text-dark hover:bg-bg-gray"
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* Result */}
          <div className="rounded-card bg-bg-gray p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Тариф</span>
              <span className="font-medium text-dark">{calculation.plan.name}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-text-muted">Цена за пользователя</span>
              <span className="font-medium text-dark">
                {formatPrice(calculation.pricePerUser)}/мес
              </span>
            </div>
            {calculation.totalDiscount > 0 ? (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-text-muted">Скидка</span>
                <span className="font-medium text-success">
                  {formatDiscount(calculation.totalDiscount)}
                </span>
              </div>
            ) : null}
            <hr className="my-3 border-border" />
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-dark">Итого за {calculation.months} мес</span>
              <span className="text-2xl font-extrabold text-primary">
                {formatPrice(calculation.totalPayment)}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
