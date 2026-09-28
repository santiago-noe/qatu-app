import Image from "next/image";
import { MapPin } from "lucide-react";
import { IconBadge } from "@/components/layout/icon-badge";
import { PILOT_AREA, SITE_TAGLINE } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { Showcase } from "@/features/auth/shared/lib/showcase";
import toolsBench from "@/public/images/auth/tools-bench.webp";

// Panel oscuro de marca: la foto de herramientas, muy oscurecida, da calidez sin quitar lectura.
// No es un encabezado: el h1 de la página es el del formulario.
export function AuthShowcase({ showcase, className }: { showcase: Showcase; className?: string }) {
  const { eyebrow, lines, highlight, text, benefits } = showcase;
  return (
    <aside
      aria-label="Por qué Qatu"
      className={cn("relative flex-col justify-between overflow-hidden bg-footer p-10 text-white", className)}
    >
      <Image
        src={toolsBench}
        alt=""
        fill
        priority
        placeholder="blur"
        sizes="(min-width: 1024px) 520px, 0px"
        className="object-cover opacity-40"
      />
      {/* Texto claro sobre --footer al 85–95 %: el contraste se mantiene (≥ 7:1) */}
      <div className="absolute inset-0 bg-gradient-to-b from-footer/95 via-footer/85 to-footer/95" aria-hidden />

      <div className="relative">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-footer-ink">
          <MapPin className="size-3.5 text-brand" strokeWidth={2} aria-hidden />
          Piloto en {PILOT_AREA}
        </span>

        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.14em] text-brand">{eyebrow}</p>
        <p className="mt-2 text-[clamp(1.9rem,2.6vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.02em]">
          {lines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
          <span className="block text-brand">{highlight}</span>
        </p>
        <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-footer-ink">{text}</p>

        <ul className="mt-8 space-y-3">
          {benefits.map(({ icon, title, text: detail }) => (
            <li key={title} className="flex items-start gap-3.5 rounded-xl border border-white/10 bg-white/[0.06] p-3.5">
              <IconBadge icon={icon} tone="solid" size="sm" className="rounded-lg" />
              <span>
                <span className="block text-[15px] font-semibold leading-snug">{title}</span>
                <span className="mt-0.5 block text-[13px] leading-snug text-footer-ink-2">{detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative mt-10 flex justify-between text-xs text-footer-ink-2">
        <span>{SITE_TAGLINE}</span>
        <span>{PILOT_AREA}, Ayacucho</span>
      </p>
    </aside>
  );
}
