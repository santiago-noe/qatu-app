import { Info } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { TRUST } from "../lib/content";
import { IconBadge } from "@/components/layout/icon-badge";

export function Trust() {
  return (
    <section aria-labelledby="confianza-titulo" className="py-14 md:py-20">
      <Container className="space-y-8">
        <SectionHeading id="confianza-titulo" {...TRUST.intro} />

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.items.map(({ icon, title, text }) => (
            <li key={title} className="space-y-3 rounded-[var(--radius-card)] border border-line bg-bg p-5">
              <IconBadge icon={icon} />
              <h3 className="text-base font-semibold text-ink">{title}</h3>
              <p className="text-sm leading-relaxed text-ink-2">{text}</p>
            </li>
          ))}
        </ul>

        <p className="flex items-start gap-2 text-sm text-ink-2">
          <Info className="mt-0.5 size-4 shrink-0 text-brand-text" strokeWidth={1.75} aria-hidden />
          {TRUST.note}
        </p>
      </Container>
    </section>
  );
}
