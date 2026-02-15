/**
 * LandingPage — main marketing page composing all landing sections.
 * Displays TopBar, Navbar, Hero, BigNumbers, Features, Pricing, Calculator, FAQ,
 * RegisterSection, and Footer in order.
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

interface LandingPageProps extends Record<string, never> {}

/** Landing page — all marketing sections composed together */
export const LandingPage: React.FC<LandingPageProps> = () => {
  return (
    <div className="min-h-screen">
      <TopBar />
      <Navbar />
      <Hero />
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
