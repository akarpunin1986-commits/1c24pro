/**
 * TopBar — dark promotional banner for the partner program.
 * Displays at the very top of the landing page.
 * @see TZ section 5.3 — TopBar description
 */

import { TOP_BAR_TEXT, TOP_BAR_CTA } from "@/constants/design";

interface TopBarProps extends Record<string, never> {}

/** Partner program promotional top bar */
export const TopBar: React.FC<TopBarProps> = () => {
  return (
    <div className="bg-dark py-2.5 text-center text-sm text-white/90">
      <span>{TOP_BAR_TEXT}</span>
      <a
        href="#"
        className="ml-2 font-medium text-primary underline-offset-2 transition-colors hover:text-primary-hover hover:underline"
      >
        {TOP_BAR_CTA} &rarr;
      </a>
    </div>
  );
};
