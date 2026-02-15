/**
 * LandingPage — main marketing page composing all landing sections.
 * Uses useAuth() to personalize Hero and Navbar for authenticated users.
 * @see TZ section 5.3 — Landing page sections
 */

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

/** Landing page — all marketing sections composed together */
export const LandingPage: React.FC = () => {
  const { user, loading, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <TopBar />
      <Navbar user={user} onLogout={logout} />
      <Hero user={user} loading={loading} />
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
