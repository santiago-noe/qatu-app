import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { FAQ, FAQ_INTRO } from "../lib/content";

export function Faq() {
  return (
    <section id="preguntas-frecuentes" aria-labelledby="faq-titulo" className="bg-bg-soft py-14 md:py-20">
      <Container className="grid gap-8 lg:grid-cols-[1fr_1.6fr]">
        <SectionHeading id="faq-titulo" {...FAQ_INTRO} className="self-start" />

        <Accordion type="single" collapsible className="border-t border-line">
          {FAQ.map((item, i) => (
            <AccordionItem key={item.question} value={`faq-${i}`} className="border-line">
              <AccordionTrigger className="py-5 text-base font-medium text-ink hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-[15px] leading-relaxed text-ink-2">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </section>
  );
}
