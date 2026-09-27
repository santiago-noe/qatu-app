import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { HERO } from "../lib/content";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-bg-soft">
      {/* Una sola imagen: arriba en móvil, a la derecha en escritorio, fundida con el fondo */}
      <div className="relative h-[280px] sm:h-[360px] md:absolute md:inset-y-0 md:right-0 md:h-auto md:w-[62%] [mask-image:linear-gradient(to_bottom,black_75%,transparent)] md:[mask-image:linear-gradient(to_right,transparent,black_30%)]">
        <Image
          src={HERO.image.src}
          alt={HERO.image.alt}
          fill
          priority
          sizes="(min-width: 768px) 62vw, 100vw"
          className="object-cover object-[70%_center]"
        />
      </div>

      <Container className="relative">
        <div className="max-w-[560px] space-y-7 pb-14 pt-6 md:py-24">
          <h1 className="text-[40px] font-bold leading-[1.02] tracking-[-0.03em] text-ink md:text-[64px]">
            {HERO.title.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            <span className="block text-ink-2">{HERO.titleMuted}</span>
          </h1>

          <p className="max-w-[440px] text-lg leading-relaxed text-ink-2">{HERO.subtitle}</p>

          <ul className="flex divide-x divide-line">
            {HERO.features.map(({ icon: Icon, label }) => (
              <li key={label} className="flex flex-1 flex-col items-center gap-3 px-3 text-center first:pl-0 last:pr-0">
                <span className="flex size-16 items-center justify-center rounded-full bg-bg">
                  <Icon className="size-7 text-ink" strokeWidth={1.5} aria-hidden />
                </span>
                <span className="text-sm font-medium leading-tight text-ink">{label}</span>
              </li>
            ))}
          </ul>

          <Button asChild size="lg" className="h-14 rounded-[10px] px-8 text-base">
            <a href={HERO.cta.href}>
              {HERO.cta.label}
              <ArrowRight className="size-5" strokeWidth={1.5} aria-hidden />
            </a>
          </Button>
        </div>
      </Container>
    </section>
  );
}
