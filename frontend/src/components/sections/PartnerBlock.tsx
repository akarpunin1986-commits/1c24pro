/**
 * PartnerBlock — referral/partner program section for top-tier subscribers.
 * Shows referral code and explains how the partner program works.
 */

import { useState } from "react";

interface PartnerBlockProps {
  referralCode: string;
}

export const PartnerBlock: React.FC<PartnerBlockProps> = ({ referralCode }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (): void => {
    void navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-16">
      <div className="mx-auto max-w-3xl px-6">
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-orange-50 p-8 shadow-sm">
          <div className="mb-6 text-center">
            <span className="mb-3 inline-block text-4xl">🤝</span>
            <h2 className="text-2xl font-bold text-gray-900">
              Партнёрская программа
            </h2>
            <p className="mt-2 text-gray-500">
              Зарабатывайте 20% с каждого приведённого клиента
            </p>
          </div>

          {/* Referral code */}
          <div className="mb-8 flex items-center justify-center gap-3">
            <span className="text-sm text-gray-500">Ваш реферальный код:</span>
            <code className="rounded-lg bg-gray-100 px-4 py-2 text-lg font-bold tracking-wider text-gray-900">
              {referralCode}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            >
              {copied ? "Скопировано!" : "Скопировать"}
            </button>
          </div>

          {/* How it works */}
          <div className="rounded-xl border border-gray-100 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
              Как это работает
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-primary">
                  1
                </span>
                <p className="text-sm text-gray-700">
                  Поделитесь кодом с коллегами и партнёрами
                </p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-primary">
                  2
                </span>
                <p className="text-sm text-gray-700">
                  Они получают +7 дней к тестовому периоду
                </p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-primary">
                  3
                </span>
                <p className="text-sm text-gray-700">
                  Вы получаете 20% от их первой оплаты
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
