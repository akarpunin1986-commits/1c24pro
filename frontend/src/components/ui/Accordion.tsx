/**
 * Accordion — expandable/collapsible content panel.
 * Used in the FAQ section on the landing page.
 */

import { useState } from "react";

interface AccordionProps {
  /** Accordion header / question text */
  title: string;
  /** Accordion body / answer content */
  children: React.ReactNode;
  /** Whether the accordion is initially open */
  defaultOpen?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/** Expandable accordion panel component */
export const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  defaultOpen = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border-b border-border ${className}`}>
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
        }}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="pr-4 text-base font-medium text-dark">{title}</span>
        <span
          className={`flex-shrink-0 text-text-muted transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96 pb-5" : "max-h-0"
        }`}
      >
        <div className="text-sm leading-relaxed text-text-muted">{children}</div>
      </div>
    </div>
  );
};
