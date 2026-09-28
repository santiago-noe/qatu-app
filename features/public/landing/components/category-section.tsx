import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import type { CategoryItem, CategorySectionData } from "../lib/content";
import { buildSearchUrl } from "../lib/search";

const VISIBLE = 5;

// Visual de la tarjeta: la foto si existe; si no, el ícono sobre fondo oscuro.
function CardVisual({ item, featured }: { item: CategoryItem; featured: boolean }) {
  if (item.image) {
    return (
      <Image
        src={item.image.src}
        alt={item.image.alt}
        fill
        sizes={
          featured
            ? "(min-width: 1024px) 560px, (min-width: 768px) 90vw, 80vw"
            : "(min-width: 1024px) 280px, (min-width: 768px) 45vw, 80vw"
        }
        className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
    );
  }
  const Icon = item.icon;
  return Icon ? (
    <span className="absolute inset-0 flex items-start justify-end p-6" aria-hidden>
      <Icon
        className={cn(
          "text-brand transition-transform duration-500 group-hover:scale-110 motion-reduce:transition-none",
          featured ? "size-32" : "size-16",
        )}
        strokeWidth={1}
      />
    </span>
  ) : null;
}

interface CategorySectionProps {
  section: CategorySectionData;
  /** Tarjetas del catálogo de qatu-api; sin tarjetas (API caído) la sección no se muestra. */
  items: CategoryItem[];
}

// Mosaico de categorías (herramientas u oficios): la primera tarjeta destaca a doble tamaño.
export function CategorySection({ section, items }: CategorySectionProps) {
  const { id, tab, intro, cta, tone } = section;
  if (items.length === 0) return null;
  const titleId = `${id}-titulo`;
  const visible = items.slice(0, VISIBLE);
  const hasMore = items.length > VISIBLE;

  return (
    <section id={id} aria-labelledby={titleId} className={cn("py-14 md:py-20", tone === "soft" && "bg-bg-soft")}>
      <Container className="space-y-8">
        <SectionHeading
          id={titleId}
          {...intro}
          action={
            hasMore && (
              <Link
                href={buildSearchUrl({ tab })}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-brand-text"
              >
                Ver todos
                <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
              </Link>
            )
          }
        />

        <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4 lg:grid-rows-[280px_280px]">
          {visible.map((item, i) => {
            const featured = i === 0;
            return (
              <li
                key={item.slug}
                className={cn(
                  "aspect-[4/5] w-[80%] shrink-0 snap-start sm:w-[55%] md:aspect-[4/3] md:w-auto lg:aspect-auto",
                  featured && "md:col-span-2 lg:row-span-2",
                )}
              >
                <Link
                  href={buildSearchUrl({ tab, category: item.slug })}
                  className="group relative flex h-full overflow-hidden rounded-[var(--radius-card)] bg-ink"
                >
                  <CardVisual item={item} featured={featured} />
                  {/* Degradado para que el texto blanco se lea sobre cualquier foto */}
                  <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" aria-hidden />

                  <span className="relative mt-auto flex w-full flex-col gap-2 p-5 md:p-6">
                    <span className={cn("font-semibold text-white", featured ? "text-2xl md:text-3xl" : "text-xl")}>
                      {item.name}
                    </span>
                    <span className={cn("text-white/85", featured ? "max-w-sm text-base" : "text-sm")}>
                      {item.description}
                    </span>
                    <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-[var(--radius-control)] bg-brand px-4 py-2 text-sm font-semibold text-ink">
                      {cta}
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
