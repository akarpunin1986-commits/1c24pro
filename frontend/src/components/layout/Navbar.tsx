/**
 * Navbar — fixed navigation bar with logo, links, and auth buttons.
 * Shows shadow on scroll. Links to sections on landing page.
 * @see TZ section 5.3 — Navbar description
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { NAV_LINKS } from "@/constants/design";

interface NavbarProps extends Record<string, never> {}

/** Main navigation bar component */
export const Navbar: React.FC<NavbarProps> = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = (): void => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 bg-white/95 backdrop-blur-sm transition-shadow ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-extrabold text-white">
            1С
          </div>
          <span className="text-lg font-bold text-dark">24.pro</span>
        </Link>

        {/* Nav links */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-muted transition-colors hover:text-dark"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/auth"
            className="rounded-button px-4 py-2 text-sm font-medium text-dark transition-colors hover:bg-bg-gray"
          >
            Войти
          </Link>
          <Link
            to="/auth"
            className="rounded-button bg-dark px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-dark-hover"
          >
            Начать бесплатно
          </Link>
        </div>
      </div>
    </nav>
  );
};
