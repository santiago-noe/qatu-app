import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { TOOL_CATEGORIES, TOOL_CATEGORIES_INTRO } from "../lib/content";
import { buildSearchUrl, toSlug } from "../lib/search";

// Categorías de herramientas en mosaico: la primera destaca a doble tamaño en escritorio.
// Foto a sangre con el texto encima; cada tarjeta lleva a la búsqueda ya filtrada.
export function ToolCategories() {
  return (
    <section id="herramientas" aria-labelledby="herramientas-titulo" className="py-14 md:py-20">
      <Container className="space-y-8">
        <SectionHeading id="herramientas-titulo" {...TOOL_CATEGORIES_INTRO} />

        <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4 lg:grid-rows-[280px_280px]">
          {TOOL_CATEGORIES.map(({ name, description, image }, i) => {
            const featured = i === 0;
            return (
              <li
                key={name}
                className={cn(
                  "aspect-[4/5] w-[80%] shrink-0 snap-start sm:w-[55%] md:aspect-[4/3] md:w-auto lg:aspect-auto",
                  featured && "md:col-span-2 lg:row-span-2",
                )}
              >
                <Link
                  href={buildSearchUrl({ tab: "rent", category: toSlug(name) })}
                  className="group relative flex h-full overflow-hidden rounded-[var(--radius-card)] bg-ink"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes={featured ? "(min-width: 1024px) 560px, (min-width: 768px) 90vw, 80vw" : "(min-width: 1024px) 280px, (min-width: 768px) 45vw, 80vw"}
                    className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                  {/* Degradado para que el texto blanco se lea sobre cualquier foto */}
                  <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" aria-hidden />

                  <span className="relative mt-auto flex w-full flex-col gap-2 p-5 md:p-6">
                    <span className={cn("font-semibold text-white", featured ? "text-2xl md:text-3xl" : "text-xl")}>
                      {name}
                    </span>
                    <span className={cn("text-white/85", featured ? "max-w-sm text-base" : "text-sm")}>{description}</span>
                    <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-[var(--radius-control)] bg-brand px-4 py-2 text-sm font-semibold text-ink">
                      Ver equipos
                      <ArrowRight
                        className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                        strokeWidth={2}
                        aria-hidden
                      />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
