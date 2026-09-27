import { Container } from "@/components/layout/container";
import { HOW_IT_WORKS } from "../lib/content";

// Franja amarilla de marca con los 4 pasos; texto gris oscuro sobre amarillo (8,41:1).
export function HowItWorks() {
  return (
    <section id="como-funciona" aria-labelledby="como-funciona-titulo" className="bg-brand">
      <Container className="grid gap-8 py-10 md:py-12 lg:grid-cols-[200px_1fr] lg:items-center">
        <h2 id="como-funciona-titulo" className="text-lg font-bold uppercase tracking-[0.02em] text-ink">
          {HOW_IT_WORKS.title}
        </h2>

        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-ink/20">
          {HOW_IT_WORKS.steps.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="flex items-start gap-4 lg:px-6 lg:first:pl-0 lg:last:pr-0">
              <Icon className="mt-0.5 size-8 shrink-0 text-ink" strokeWidth={1.5} aria-hidden />
              <div>
                <p className="text-[15px] font-semibold text-ink">
                  {i + 1}. {title}
                </p>
                <p className="text-sm leading-snug text-ink/80">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
