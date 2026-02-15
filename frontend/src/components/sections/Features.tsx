/**
 * Features — 2x2 grid of feature cards with colored accents.
 * 01 All-inclusive (orange), 02 SQL .bak (blue), 03 Configurator (purple), 04 Self-service (pink).
 * @see TZ section 5.3 — Features description
 */

import { Card } from "@/components/ui/Card";
import type { FeatureCard } from "@/types/common";

interface FeaturesProps extends Record<string, never> {}

const FEATURES: readonly FeatureCard[] = [
  {
    number: "01",
    title: "Всё включено",
    description: "Сервер, лицензии, бэкапы, обновления — всё в одной подписке.",
    color: "orange",
    items: ["Ежедневные бэкапы", "Обновления конфигураций", "Техподдержка"],
  },
  {
    number: "02",
    title: "Загрузка SQL .bak",
    description: "Единственные на рынке: загрузите свой SQL-бэкап напрямую через браузер.",
    color: "blue",
    items: ["До 50 ГБ файлы", "Формат .dt и .bak", "Resume при обрыве"],
  },
  {
    number: "03",
    title: "Конфигуратор через RDP",
    description: "Полный доступ к конфигуратору 1С через удалённый рабочий стол. Бесплатно.",
    color: "purple",
    items: ["Бесплатно на всех тарифах", "Скачайте .rdp файл", "Работайте как на своём сервере"],
  },
  {
    number: "04",
    title: "Self-service за 10 минут",
    description: "Регистрация без менеджеров: телефон, ИНН, загрузка — и вы в 1С.",
    color: "pink",
    items: ["Без менеджеров", "Автозаполнение по ИНН", "67 дней на решение"],
  },
] as const;

const COLOR_CLASSES: Record<FeatureCard["color"], string> = {
  orange: "text-primary bg-orange-50",
  blue: "text-blue bg-blue-50",
  purple: "text-purple bg-purple-50",
  pink: "text-pink bg-pink-50",
};

/** Feature cards grid section */
export const Features: React.FC<FeaturesProps> = () => {
  return (
    <section id="features" className="bg-bg py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-12 text-center text-3xl font-bold text-dark">
          Почему 1C24.PRO
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          {FEATURES.map((feature) => (
            <Card key={feature.number} padding="lg" className="transition-shadow hover:shadow-md">
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold ${COLOR_CLASSES[feature.color]}`}
              >
                {feature.number}
              </span>
              <h3 className="mt-4 text-xl font-bold text-dark">{feature.title}</h3>
              <p className="mt-2 text-sm text-text-muted">{feature.description}</p>
              <ul className="mt-4 space-y-2">
                {feature.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-text-muted">
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
