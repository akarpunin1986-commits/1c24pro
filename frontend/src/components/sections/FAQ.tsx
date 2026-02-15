/**
 * FAQ — accordion section with frequently asked questions.
 * Questions and answers sourced from constants/faq.ts.
 * @see TZ section 5.3 — FAQ section
 */

import { Accordion } from "@/components/ui/Accordion";
import { FAQ_ITEMS } from "@/constants/faq";

interface FAQProps extends Record<string, never> {}

/** FAQ accordion section */
export const FAQ: React.FC<FAQProps> = () => {
  return (
    <section id="faq" className="bg-bg-gray py-20">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="mb-12 text-center text-3xl font-extrabold text-dark md:text-[42px]">
          Частые вопросы
        </h2>

        <div>
          {FAQ_ITEMS.map((item) => (
            <Accordion key={item.question} title={item.question}>
              {item.answer}
            </Accordion>
          ))}
        </div>
      </div>
    </section>
  );
};
