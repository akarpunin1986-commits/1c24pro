/**
 * useAuth — hook for checking authentication status on landing page.
 * Calls GET /auth/me to get personalized user status.
 */

import { useState, useEffect } from "react";
import { apiClient } from "@/api/client";

export interface UserStatus {
  user_id: string;
  phone: string;
  role: string;
  status: "trial_not_started" | "trial" | "trial_ending" | "expired" | "active";
  trial_days_left: number;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  org_name: string;
  org_inn: string;
  first_name: string | null;
  last_name: string | null;
  patronymic: string | null;
  display_name: string;
  referral_code: string | null;
  tariff: string | null;
  tariff_active_until: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<UserStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }

    apiClient
      .get<UserStatus>("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => {
        // Token expired or invalid — clear it
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const isAuthenticated = !!user;

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    window.location.href = "/";
  };

  return { user, loading, isAuthenticated, logout };
}
