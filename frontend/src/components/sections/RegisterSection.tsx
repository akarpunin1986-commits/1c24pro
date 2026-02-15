/**
 * RegisterSection — CTA section with registration form on landing page.
 * Orange background with white card containing phone/INN form.
 * @see TZ section 5.3 — Register section description
 */

import { Link } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface RegisterSectionProps extends Record<string, never> {}

/** Landing page registration CTA section */
export const RegisterSection: React.FC<RegisterSectionProps> = () => {
  return (
    <section className="bg-primary py-20">
      <div className="mx-auto max-w-3xl px-6">
        <Card padding="lg" bordered={false} className="text-center shadow-xl">
          <h2 className="text-3xl font-extrabold text-dark">
            Начните работать в облаке уже сегодня
          </h2>
          <p className="mt-3 text-text-muted">
            30 дней бесплатного тестового периода. Без привязки карты.
          </p>
          <div className="mt-8">
            <Link to="/auth">
              <Button variant="primary" size="lg">
                Попробовать бесплатно — 30 дней
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-text-light">
            Регистрация за 2 минуты. Нужен только телефон и ИНН.
          </p>
        </Card>
      </div>
    </section>
  );
};
