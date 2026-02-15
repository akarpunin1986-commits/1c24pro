/**
 * Footer — simple footer with logo and copyright.
 * @see TZ section 5.3 — Footer description
 */

import { Link } from "react-router-dom";

interface FooterProps extends Record<string, never> {}

/** Site footer component */
export const Footer: React.FC<FooterProps> = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-white py-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-extrabold text-white">
            1С
          </div>
          <span className="text-base font-bold text-dark">24.pro</span>
        </Link>

        {/* Copyright */}
        <p className="text-sm text-text-muted">
          &copy; {currentYear} 1C24.PRO. Все права защищены.
        </p>
      </div>
    </footer>
  );
};
