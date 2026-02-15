/**
 * Pricing — plan cards with monthly/annual toggle.
 * Displays 3 plan tiers: Start, Business (popular), Corporation.
 * @see TZ section 5.3 — Pricing description
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PLANS } from "@/constants/plans";
import { formatPrice } from "@/utils/formatters";

interface PricingProps extends Record<string, never> {}

/** Annual discount percentage */
const ANNUAL_DISCOUNT = 0.15;

/** Pricing cards section */
export const Pricing: React.FC<PricingProps> = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="bg-bg-gray py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-4 text-center text-3xl font-extrabold text-dark md:text-[42px]">
          Тарифы
        </h2>
        <p className="mb-8 text-center text-text-muted">
          Все тарифы включают бэкапы, обновления, конфигуратор по RDP и техподдержку
        </p>

        {/* Period toggle — pill-style switcher */}
        <div className="mb-12 flex items-center justify-center">
          <div className="inline-flex rounded-full bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
                !isAnnual
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Помесячно
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
                isAnnual
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Годовой (−15%)
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => {
            const price = isAnnual
              ? Math.round(plan.price * (1 - ANNUAL_DISCOUNT))
              : plan.price;

            return (
              <Card
                key={plan.id}
                padding="lg"
                className={`relative transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] ${
                  plan.popular
                    ? "border-2 border-primary shadow-lg hover:shadow-[0_16px_48px_rgba(255,107,0,0.2)]"
                    : "hover:border-gray-300"
                }`}
              >
                {plan.popular ? (
                  <Badge variant="orange" className="absolute -top-3 right-6">
                    Популярный
                  </Badge>
                ) : null}

                <h3 className="text-xl font-bold text-dark">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-extrabold text-dark">{formatPrice(price, false)}</span>
                  <span className="text-sm text-text-muted"> ₽/мес за пользователя</span>
                </div>

                <p className="mt-1 text-xs text-text-light">от {plan.minUsers} пользователей</p>

                <ul className="mt-6 space-y-3">
                  <li className="text-sm text-text-muted">
                    {plan.basesIncluded} {plan.basesIncluded === 1 ? "база" : "баз"} включено
                  </li>
                  <li className="text-sm text-text-muted">{plan.disk} ГБ хранилище</li>
                  <li className="text-sm text-text-muted">Поддержка: {plan.support}</li>
                  <li className="text-sm text-text-muted">Реакция: {plan.reaction}</li>
                </ul>

                <Link to="/auth" className="mt-6 block">
                  <Button
                    variant={plan.popular ? "primary" : "dark"}
                    fullWidth
                  >
                    Начать бесплатно
                  </Button>
                </Link>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
