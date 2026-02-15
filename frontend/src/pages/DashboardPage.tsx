/**
 * DashboardPage — client personal dashboard (Личный кабинет).
 * Shows trial banner, databases, upload zone, and profile.
 * @see TZ section 2.3 — Dashboard layout
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { TrialBanner } from "@/components/dashboard/TrialBanner";
import { DatabaseCard } from "@/components/dashboard/DatabaseCard";
import { UploadZone } from "@/components/dashboard/UploadZone";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { Button } from "@/components/ui/Button";
import type { MeResponse, DatabaseRecord } from "@/types/api";

interface DashboardPageProps extends Record<string, never> {}

/** Placeholder data for initial render */
const PLACEHOLDER_ME: MeResponse = {
  user: {
    id: "",
    phone: "+70000000000",
    email: null,
    email_verified: false,
    role: "owner",
    referral_code: "XXXXXXXX",
    status: "active",
  },
  organization: {
    id: "",
    name_short: "Загрузка...",
    inn: "",
    slug: "",
  },
  trial: {
    active: true,
    started_at: new Date().toISOString(),
    ends_at: new Date().toISOString(),
    days_left: 30,
  },
};

/** Client dashboard page */
export const DashboardPage: React.FC<DashboardPageProps> = () => {
  const [meData] = useState<MeResponse>(PLACEHOLDER_ME);
  const [databases] = useState<DatabaseRecord[]>([]);

  const handleFileSelect = (_file: File): void => {
    // TODO: Initiate chunked upload flow
  };

  const handleLogout = (): void => {
    // TODO: Call logout API, clear tokens, redirect
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/auth";
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-extrabold text-white">
                1С
              </div>
              <span className="text-base font-bold text-dark">24.pro</span>
            </Link>
            <span className="text-sm text-text-muted">
              {meData.organization.name_short}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-text-muted">Профиль</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Выйти
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="space-y-6">
          {/* Trial banner */}
          <TrialBanner trial={meData.trial} />

          {/* Databases section */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-dark">Мои базы</h2>
            {databases.length > 0 ? (
              <div className="space-y-4">
                {databases.map((db) => (
                  <DatabaseCard key={db.id} database={db} />
                ))}
              </div>
            ) : (
              <div className="rounded-card border border-border bg-white p-8 text-center">
                <p className="text-text-muted">У вас пока нет баз.</p>
                <p className="text-sm text-text-light">
                  Загрузите свою базу 1С или создайте новую!
                </p>
              </div>
            )}
          </section>

          {/* Upload section */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-dark">Загрузить новую базу</h2>
            <UploadZone onFileSelect={handleFileSelect} />
          </section>

          {/* Profile section */}
          <section>
            <ProfileCard user={meData.user} organization={meData.organization} />
          </section>
        </div>
      </main>
    </div>
  );
};
