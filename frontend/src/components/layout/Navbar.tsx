/**
 * Navbar — fixed navigation bar with logo, links, and auth buttons.
 * Personalized for authenticated users: shows org name + dashboard link.
 * @see TZ section 5.3 — Navbar description
 */

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { NAV_LINKS } from "@/constants/design";
import type { UserStatus } from "@/hooks/useAuth";

interface NavbarProps {
  user?: UserStatus | null;
  onLogout?: () => void;
}

/** Main navigation bar component */
export const Navbar: React.FC<NavbarProps> = ({ user = null, onLogout }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = (): void => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [menuOpen]);

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

        {/* Nav links — hide "Возможности" for authenticated users */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.filter((link) => user ? link.href !== "#features" : true).map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-muted transition-colors hover:text-dark"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          onClick={() => setMobileNavOpen((v) => !v)}
          aria-label="Меню"
        >
          {mobileNavOpen ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Auth area */}
        {user ? (
          /* Authenticated user */
          <div className="relative flex items-center gap-3" ref={menuRef}>
            <Link
              to="/dashboard"
              className="rounded-button bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            >
              Личный кабинет
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-button px-3 py-2 text-sm font-medium text-dark transition-colors hover:bg-bg-gray"
            >
              <span className="hidden sm:inline">{user.display_name || user.org_name}</span>
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
                {user.org_name && (
                  <div className="border-b border-gray-100 px-4 pb-2 pt-1">
                    <p className="truncate text-xs text-gray-500">{user.org_name}</p>
                  </div>
                )}
                <Link
                  to="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Личный кабинет
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout?.();
                  }}
                  className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Выйти
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Guest */
          <div className="hidden items-center gap-3 md:flex">
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
        )}
      </div>

      {/* Mobile nav links */}
      {mobileNavOpen && (
        <div className="border-t border-gray-100 bg-white px-6 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.filter((link) => (user ? link.href !== "#features" : true)).map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileNavOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-gray-50 hover:text-dark"
              >
                {link.label}
              </a>
            ))}
          </div>
          {!user && (
            <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3">
              <Link
                to="/auth"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-button px-4 py-2 text-center text-sm font-medium text-dark transition-colors hover:bg-bg-gray"
              >
                Войти
              </Link>
              <Link
                to="/auth"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-button bg-dark px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-dark-hover"
              >
                Начать бесплатно
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
