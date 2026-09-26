import { MapPin } from "lucide-react";
import { HERO } from "../lib/content";
import { SearchPanel } from "./search-panel";

export function Hero() {
  return (
    <section className="bg-gradient-to-b from-surface-low to-surface pb-6 pt-10 md:pt-14">
      <div className="mx-auto max-w-[1280px] space-y-8 px-4 md:px-8">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-lowest px-4 py-1.5 text-xs font-bold text-on-surface-variant">
            <span className="size-1.5 rounded-full bg-tertiary" aria-hidden />
            {HERO.badge}
          </span>

          <h1 className="text-[1.9rem] font-extrabold leading-[1.12] tracking-tight md:text-5xl">
            Alquila la herramienta que necesitas.{" "}
            <span className="text-primary">Contrata al técnico que te la resuelve.</span>
          </h1>

          <p className="mx-auto max-w-xl text-base leading-relaxed text-on-surface-variant">
            {HERO.subtitle}
          </p>
        </div>

        <SearchPanel />

        <p className="flex items-center justify-center gap-2 text-xs text-on-surface-variant">
          <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
          {HERO.districtsNote}
        </p>
      </div>
    </section>
  );
}
