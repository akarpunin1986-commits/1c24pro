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

        {/* Period toggle */}
        <div className="mb-12 flex items-center justify-center gap-3">
          <span className={`text-sm ${!isAnnual ? "font-medium text-dark" : "text-text-muted"}`}>
            Помесячно
          </span>
          <button
            type="button"
            onClick={() => {
              setIsAnnual((prev) => !prev);
            }}
            className={`relative h-7 w-12 rounded-full transition-colors ${
              isAnnual ? "bg-primary" : "bg-border"
            }`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                isAnnual ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
          <span className={`text-sm ${isAnnual ? "font-medium text-dark" : "text-text-muted"}`}>
            Годовой (−15%)
          </span>
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
                className={`relative ${plan.popular ? "border-2 border-primary shadow-lg" : ""}`}
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
