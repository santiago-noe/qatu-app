import { Button } from "@/components/ui/button";
import { Hammer, HardHat, MapPin } from "lucide-react";
import { HERO } from "../lib/content";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-surface-low via-surface to-surface pb-14 pt-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-primary-fixed/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-1/2 size-80 rounded-full bg-secondary-container/40 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-[1200px] items-center gap-10 px-4 md:px-6 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-7">
          <span className="inline-flex items-center gap-2 rounded-full bg-surface-lowest px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary shadow-sm">
            <span className="size-1.5 rounded-full bg-tertiary" aria-hidden />
            {HERO.badge}
          </span>

          <h1 className="text-[1.9rem] font-extrabold leading-[1.1] tracking-tight md:text-5xl">
            El lugar de Ayacucho para{" "}
            <span className="text-primary underline decoration-primary-fixed decoration-4 underline-offset-4">
              alquilar la herramienta
            </span>{" "}
            que necesitas y contratar al{" "}
            <span className="text-secondary">técnico que te la resuelve</span>.
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-on-surface-variant">
            {HERO.subtitle}
          </p>

          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-xl px-6 font-semibold">
              <a href="#herramientas">
                <HardHat aria-hidden />
                {HERO.ctaTools}
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="h-12 rounded-xl bg-inverse-surface px-6 font-semibold text-inverse-on-surface hover:bg-secondary"
            >
              <a href="#servicios">
                <Hammer aria-hidden />
                {HERO.ctaServices}
              </a>
            </Button>
          </div>

          <p className="flex items-start gap-2 pt-1 text-xs text-on-surface-variant">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            {HERO.districtsNote}
          </p>
        </div>

        <div className="lg:col-span-5">
          <div className="relative mx-auto max-w-md">
            <div
              aria-hidden
              className="absolute inset-0 translate-x-2 translate-y-2 rotate-2 rounded-2xl bg-primary-fixed/70"
            />
            <div className="relative space-y-3 rounded-2xl bg-surface-lowest p-5 shadow-xl">
              <p className="text-sm font-bold text-on-surface">
                Dos formas de resolver tu trabajo
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex h-36 flex-col justify-between rounded-xl bg-surface-low p-3">
                  <HardHat className="size-8 text-primary" aria-hidden />
                  <div>
                    <p className="text-sm font-bold">Alquila</p>
                    <p className="text-xs text-on-surface-variant">
                      Herramientas y equipos por horas o días.
                    </p>
                  </div>
                </div>
                <div className="flex h-36 flex-col justify-between rounded-xl bg-surface-low p-3">
                  <Hammer className="size-8 text-secondary" aria-hidden />
                  <div>
                    <p className="text-sm font-bold">Contrata</p>
                    <p className="text-xs text-on-surface-variant">
                      Técnicos de oficio con precio claro.
                    </p>
                  </div>
                </div>
              </div>
              <p className="rounded-xl bg-surface-low p-3 text-xs text-on-surface-variant">
                Ves el total en soles (S/), desglosado, antes de confirmar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
