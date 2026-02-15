/**
 * TrialBanner — displays trial period remaining days and warnings.
 * Changes color/message as trial expiration approaches.
 * @see TZ section 2.8 — Trial lifecycle
 */

import { Badge } from "@/components/ui/Badge";
import { pluralize } from "@/utils/formatters";
import type { TrialInfo } from "@/types/api";

interface TrialBannerProps {
  /** Trial period information */
  trial: TrialInfo;
}

/** Trial period status banner */
export const TrialBanner: React.FC<TrialBannerProps> = ({ trial }) => {
  if (!trial.active) return null;

  const variant = trial.days_left <= 3 ? "red" : trial.days_left <= 7 ? "yellow" : "blue";
  const dayWord = pluralize(trial.days_left, ["день", "дня", "дней"]);

  return (
    <div
      className={`rounded-card p-4 ${
        variant === "red"
          ? "border border-red-200 bg-red-50"
          : variant === "yellow"
            ? "border border-yellow-200 bg-yellow-50"
            : "border border-blue-200 bg-blue-50"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant={variant}>Тестовый период</Badge>
          <span className="text-sm text-dark">
            Осталось <span className="font-bold">{trial.days_left}</span> {dayWord}
          </span>
        </div>
        {trial.days_left <= 7 ? (
          <a href="#" className="text-sm font-medium text-primary hover:text-primary-hover">
            Выбрать тариф &rarr;
          </a>
        ) : null}
      </div>
    </div>
  );
};
