/**
 * LandingPage — personalized marketing page.
 * Shows different sections based on user authentication status and tariff.
 * @see TZ section 5.3 — Landing page sections
 */

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { BigNumbers } from "@/components/sections/BigNumbers";
import { Features } from "@/components/sections/Features";
import { Pricing } from "@/components/sections/Pricing";
import { Calculator } from "@/components/sections/Calculator";
import { FAQ } from "@/components/sections/FAQ";
import { RegisterSection } from "@/components/sections/RegisterSection";
import { UpsellBlock } from "@/components/sections/UpsellBlock";
import { PartnerBlock } from "@/components/sections/PartnerBlock";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/api/client";

interface DbInfo {
  id: string;
  name: string;
  db_name: string;
  config_code: string;
  config_name: string;
  status: string;
  web_url: string | null;
  rdp_url: string | null;
  size_gb: number | null;
  last_backup_at: string | null;
  created_at: string;
}

/** Landing page — sections vary by user state */
export const LandingPage: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const [databases, setDatabases] = useState<DbInfo[]>([]);

  useEffect(() => {
    if (user) {
      apiClient
        .get<DbInfo[]>("/me/databases")
        .then((res) => setDatabases(res.data))
        .catch(() => setDatabases([]));
    }
  }, [user]);

  const isGuest = !user;
  const isTrialNotStarted = user?.status === "trial_not_started";
  const isTrial = user?.status === "trial" || user?.status === "trial_ending";
  const isExpired = user?.status === "expired";
  const isActive = user?.status === "active";
  const tariff = user?.tariff;

  return (
    <>
      {/* TopBar — only for guests */}
      {isGuest && <TopBar />}

      <Navbar user={user} onLogout={logout} />

      <Hero user={user} databases={databases} loading={loading} />

      {/* Guest: full marketing landing */}
      {isGuest && (
        <>
          <BigNumbers />
          <Features />
          <Pricing />
          <Calculator />
          <RegisterSection />
        </>
      )}

      {/* Trial / trial not started: pricing + calculator */}
      {(isTrial || isTrialNotStarted) && (
        <>
          <Pricing
            title="Тарифы"
            subtitle={isTrialNotStarted
              ? "Все тарифы включают бэкапы, обновления, конфигуратор по RDP и техподдержку. 30 дней бесплатно."
              : "Все тарифы включают бэкапы, обновления, конфигуратор по RDP и техподдержку."
            }
          />
          <Calculator />
        </>
      )}

      {/* Expired: bring back to payment */}
      {isExpired && (
        <Pricing
          title="Выберите тариф, чтобы разморозить базы"
          subtitle="Ваши данные в безопасности. После оплаты базы будут доступны в течение часа."
        />
      )}

      {/* Active on Start: upsell to Business */}
      {isActive && tariff === "start" && (
        <UpsellBlock currentTariff="start" />
      )}

      {/* Active on Business: upsell to Corporation */}
      {isActive && tariff === "business" && (
        <UpsellBlock currentTariff="business" />
      )}

      {/* Active on Corporation: partner program */}
      {isActive && tariff === "corporation" && user.referral_code && (
        <PartnerBlock referralCode={user.referral_code} />
      )}

      <FAQ />
      <Footer />
    </>
  );
};
