/**
 * LandingPage — main marketing page composing all landing sections.
 * Uses useAuth() to personalize Hero and Navbar for authenticated users.
 * Loads user databases for the Hero right-column panel.
 * @see TZ section 5.3 — Landing page sections
 */

import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { BigNumbers } from "@/components/sections/BigNumbers";
import { Features } from "@/components/sections/Features";
import { Pricing } from "@/components/sections/Pricing";
import { Calculator } from "@/components/sections/Calculator";
import { FAQ } from "@/components/sections/FAQ";
import { RegisterSection } from "@/components/sections/RegisterSection";
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

/** Landing page — all marketing sections composed together */
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

  return (
    <div className="min-h-screen">
      <TopBar />
      <Navbar user={user} onLogout={logout} />
      <Hero user={user} databases={databases} loading={loading} />
      <BigNumbers />
      <Features />
      <Pricing />
      <Calculator />
      <FAQ />
      <RegisterSection />
      <Footer />
    </div>
  );
};
