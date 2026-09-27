import Link from "next/link";
import { ArrowRight, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { OFFER } from "../lib/content";

// Llamado para oferentes: bloque oscuro con el amarillo de marca como acento.
export function Offer() {
  return (
    <section id="ofrece-en-qatu" aria-labelledby="ofrece-titulo" className="py-14 md:py-20">
      <Container>
        <div className="grid gap-8 rounded-[var(--radius-card)] bg-ink p-6 text-white md:p-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div className="space-y-5">
            {/* Amarillo sobre gris oscuro: contraste AA como texto */}
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-brand">{OFFER.eyebrow}</p>
            <h2 id="ofrece-titulo" className="max-w-xl text-2xl font-semibold tracking-[-0.01em] md:text-[32px]">
              {OFFER.heading}
            </h2>
            <ul className="space-y-3 text-[15px] text-white/85">
              {OFFER.points.map((p) => (
                <li key={p.lead} className="flex items-start gap-3">
                  <CircleCheck className="mt-0.5 size-5 shrink-0 text-brand" strokeWidth={1.75} aria-hidden />
                  <span>
                    <strong className="font-semibold text-white">{p.lead}</strong> {p.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Button asChild className="h-12 rounded-[var(--radius-control)] bg-brand px-6 text-[15px] text-ink hover:bg-brand/90">
              <Link href={OFFER.primaryCta.href}>
                {OFFER.primaryCta.label}
                <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-[var(--radius-control)] border-white/40 bg-transparent px-6 text-[15px] text-white hover:bg-white/10 hover:text-white"
            >
              <Link href={OFFER.secondaryCta.href}>{OFFER.secondaryCta.label}</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
