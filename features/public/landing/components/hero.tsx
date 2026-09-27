import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { HERO } from "../lib/content";
import { IconBadge } from "./icon-badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-bg">
      {/* Una sola imagen: arriba en móvil y tableta, a la derecha en escritorio, fundida con el fondo blanco */}
      <div className="relative h-[260px] sm:h-[380px] lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[50%] [mask-image:linear-gradient(to_bottom,black_75%,transparent)] lg:[mask-image:linear-gradient(to_right,transparent,black_22%)]">
        <Image
          src={HERO.image.src}
          alt={HERO.image.alt}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover object-[70%_center]"
        />
      </div>

      <Container className="relative">
        <div className="max-w-[600px] space-y-6 pb-12 pt-4 lg:max-w-[46%] lg:py-20">
          <p className="eyebrow">{HERO.eyebrow}</p>

          <h1 className="text-[36px] font-bold leading-[1.05] tracking-[-0.02em] text-ink md:text-[52px]">
            {HERO.title.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            <span className="block text-brand-text">{HERO.titleHighlight}</span>
          </h1>

          <p className="max-w-[480px] text-base leading-relaxed text-ink-2">{HERO.subtitle}</p>

          <div className="flex flex-wrap gap-3">
            <Button asChild className="h-12 rounded-[var(--radius-control)] px-6 text-[15px]">
              <a href={HERO.primaryCta.href}>
                {HERO.primaryCta.label}
                <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
              </a>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-[var(--radius-control)] px-6 text-[15px]">
              <a href={HERO.secondaryCta.href}>
                {HERO.secondaryCta.label}
                <Play className="size-4" strokeWidth={1.75} aria-hidden />
              </a>
            </Button>
          </div>

          <ul className="grid gap-3 sm:grid-cols-3">
            {HERO.features.map(({ icon, title, text }) => (
              <li key={title} className="flex items-center gap-3 rounded-[var(--radius-card)] bg-cream px-3 py-2.5">
                <IconBadge icon={icon} size="sm" />
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold text-ink">{title}</span>
                  <span className="block text-xs text-ink-2">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
