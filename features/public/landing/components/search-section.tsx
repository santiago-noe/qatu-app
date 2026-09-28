import { Container } from "@/components/layout/container";
import type { ApiZone } from "@/lib/api";
import { SEARCH_SECTION } from "../lib/content";
import { SearchPanel } from "./search-panel";

// Destino del botón "Alquilar ahora" del hero y del ícono de búsqueda móvil (#buscar).
// Los distritos vienen de qatu-api (feature 002).
export function SearchSection({ zones }: { zones: ApiZone[] }) {
  return (
    <section id="buscar" aria-labelledby="buscar-titulo" className="py-14 md:py-20">
      <Container className="space-y-8">
        <h2 id="buscar-titulo" className="text-center text-[26px] font-semibold text-ink md:text-4xl">
          {SEARCH_SECTION.title}
        </h2>
        <SearchPanel zones={zones} />
        {zones.length > 0 && (
          <p className="text-center text-sm text-ink-2">
            {SEARCH_SECTION.districtsLead}: {zones.map((z) => z.name).join(", ")}.
          </p>
        )}
      </Container>
    </section>
  );
}
