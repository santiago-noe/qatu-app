import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { TOOL_CATEGORIES, TRADE_CATEGORIES } from "../lib/content";
import { buildSearchUrl, toSlug, type SearchTab } from "../lib/search";

interface RowProps {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  tab: SearchTab;
  tone: string;
  items: { icon: LucideIcon; title: string; text: string; tag?: string }[];
}

// Fila horizontal desplazable con scroll-snap, como las filas de la portada de referencia.
function Row({ id, eyebrow, title, description, tab, tone, items }: RowProps) {
  return (
    <section
      id={id}
      className="py-10 md:py-14"
      aria-labelledby={`${id}-titulo`}
    >
      <div className="mx-auto max-w-[1280px] space-y-6 px-4 md:px-8">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">
            {eyebrow}
          </p>
          <h2
            id={`${id}-titulo`}
            className="text-2xl font-extrabold md:text-3xl"
          >
            {title}
          </h2>
          <p className="max-w-xl text-sm text-on-surface-variant">
            {description}
          </p>
        </div>

        <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:-mx-8 md:px-8">
          {items.map(({ icon: Icon, title: itemTitle, text, tag }) => (
            <li
              key={itemTitle}
              className="w-[240px] shrink-0 snap-start md:w-[264px]"
            >
              <Link
                href={buildSearchUrl({
                  tab,
                  category: toSlug(tag ?? itemTitle),
                })}
                className="group block space-y-3"
              >
                <span
                  className={`flex aspect-[4/3] items-center justify-center rounded-2xl transition-shadow group-hover:shadow-md ${tone}`}
                >
                  <Icon className="size-14" aria-hidden />
                </span>
                <span className="block space-y-0.5">
                  {tag && (
                    <span className="block text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
                      {tag}
                    </span>
                  )}
                  <span className="block font-bold group-hover:underline">
                    {itemTitle}
                  </span>
                  <span className="block text-sm text-on-surface-variant">
                    {text}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// Categorías informativas: nunca muestran precios ni disponibilidad que no existan.
export function Categories() {
  return (
    <>
      <Row
        id="herramientas"
        eyebrow="Alquiler"
        title="Herramientas para tu obra"
        description="Las categorías con las que empezamos en el piloto de Huamanga."
        tab="rent"
        tone="bg-primary-fixed text-primary"
        items={TOOL_CATEGORIES}
      />
      <div className="bg-surface-low">
        <Row
          id="servicios"
          eyebrow="Servicios"
          title="Oficios para tu hogar o negocio"
          description="Contrata con precio fijo o pide cotizaciones a varios técnicos."
          tab="hire"
          tone="bg-secondary-container text-secondary"
          items={TRADE_CATEGORIES}
        />
      </div>
    </>
  );
}
