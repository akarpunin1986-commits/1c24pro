/**
 * TrialCTA — tariff selection nudge for trial users.
 * Shows three compact plan cards to help choose before trial expires.
 */

export const TrialCTA: React.FC = () => (
  <section className="bg-gradient-to-b from-orange-50 to-white py-16">
    <div className="mx-auto max-w-4xl px-6 text-center">
      <h2 className="mb-3 text-2xl font-bold text-gray-900">
        Вам подходит тариф...
      </h2>
      <p className="mb-8 text-gray-500">
        Ответьте на 2 вопроса и мы подберём оптимальный тариф
      </p>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Start */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-left transition-all hover:-translate-y-1 hover:shadow-lg">
          <p className="mb-2 text-sm text-gray-400">До 5 пользователей</p>
          <h3 className="mb-1 text-xl font-bold text-gray-900">Старт</h3>
          <p className="mb-4 text-3xl font-extrabold text-primary">
            от 4 990 ₽<span className="text-sm font-normal text-gray-400">/мес</span>
          </p>
          <p className="mb-6 text-sm text-gray-500">Идеально для ИП и малого бизнеса</p>
          <a
            href="#pricing"
            className="block w-full rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-primary-hover"
          >
            Подробнее
          </a>
        </div>

        {/* Business — recommended */}
        <div className="relative rounded-2xl border-2 border-primary bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
            Рекомендуем
          </span>
          <p className="mb-2 text-sm text-gray-400">До 25 пользователей</p>
          <h3 className="mb-1 text-xl font-bold text-gray-900">Бизнес</h3>
          <p className="mb-4 text-3xl font-extrabold text-primary">
            от 12 990 ₽<span className="text-sm font-normal text-gray-400">/мес</span>
          </p>
          <p className="mb-6 text-sm text-gray-500">Для растущих компаний</p>
          <a
            href="#pricing"
            className="block w-full rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-primary-hover"
          >
            Подробнее
          </a>
        </div>

        {/* Corporation */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-left transition-all hover:-translate-y-1 hover:shadow-lg">
          <p className="mb-2 text-sm text-gray-400">Без ограничений</p>
          <h3 className="mb-1 text-xl font-bold text-gray-900">Корпорация</h3>
          <p className="mb-4 text-3xl font-extrabold text-primary">
            от 34 990 ₽<span className="text-sm font-normal text-gray-400">/мес</span>
          </p>
          <p className="mb-6 text-sm text-gray-500">Выделенные ресурсы и SLA</p>
          <a
            href="#pricing"
            className="block w-full rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-primary-hover"
          >
            Подробнее
          </a>
        </div>
      </div>
    </div>
  </section>
);
