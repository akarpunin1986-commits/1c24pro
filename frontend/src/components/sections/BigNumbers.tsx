/**
 * BigNumbers — dark section with 4 animated stat counters.
 * Stats: 690₽, 10 min, 67 days, 28%.
 * @see TZ section 5.3 — BigNumbers description
 */

import { useInView } from "@/hooks/useInView";
import { useCounter } from "@/hooks/useCounter";
import type { BigNumberStat } from "@/types/common";

interface BigNumbersProps extends Record<string, never> {}

const STATS: readonly BigNumberStat[] = [
  { value: 690, suffix: "₽", label: "от / мес за пользователя", prefix: "от " },
  { value: 10, suffix: " мин", label: "от регистрации до работы" },
  { value: 67, suffix: " дней", label: "на принятие решения" },
  { value: 28, suffix: "%", label: "максимальная скидка" },
] as const;

/** Single animated stat display */
const StatItem: React.FC<{ stat: BigNumberStat; animate: boolean }> = ({ stat, animate }) => {
  const count = useCounter({ end: stat.value, enabled: animate });

  return (
    <div className="text-center">
      <div className="text-4xl font-extrabold text-white md:text-5xl">
        {stat.prefix ?? ""}
        {count}
        {stat.suffix}
      </div>
      <p className="mt-2 text-sm text-white/60">{stat.label}</p>
    </div>
  );
};

/** Animated big numbers section */
export const BigNumbers: React.FC<BigNumbersProps> = () => {
  const { ref, inView } = useInView({ threshold: 0.3 });

  return (
    <section ref={ref as React.Ref<HTMLElement>} className="bg-dark py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-6 md:grid-cols-4">
        {STATS.map((stat) => (
          <StatItem key={stat.label} stat={stat} animate={inView} />
        ))}
      </div>
    </section>
  );
};
