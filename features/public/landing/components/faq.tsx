import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ } from "../lib/content";

export function Faq() {
  return (
    <section id="preguntas-frecuentes" className="bg-surface-low py-14" aria-labelledby="h-faq">
      <div className="mx-auto max-w-3xl space-y-6 px-4 md:px-6">
        <h2 id="h-faq" className="text-center text-2xl font-extrabold md:text-3xl">
          Preguntas frecuentes
        </h2>
        <Accordion
          type="single"
          collapsible
          className="rounded-2xl bg-surface-lowest px-5 shadow-sm"
        >
          {FAQ.map((item, i) => (
            <AccordionItem key={item.question} value={`faq-${i}`}>
              <AccordionTrigger className="text-base font-semibold">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-on-surface-variant">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
