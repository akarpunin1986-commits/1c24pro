import { Routes, Route } from "react-router-dom";
import { LandingPage } from "@/pages/LandingPage";
import { AuthPage } from "@/pages/AuthPage";
import { OfferPage } from "@/pages/OfferPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { AdminPage } from "@/pages/AdminPage";
import { PrivateRoute } from "@/components/PrivateRoute";

/**
 * Main application component.
 * Defines the top-level route structure for the 1C24.PRO SaaS app.
 */
export const App: React.FC<Record<string, never>> = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/offer" element={<OfferPage />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};
