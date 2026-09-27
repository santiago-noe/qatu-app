import { Container } from "@/components/layout/container";
import { SEARCH_SECTION } from "../lib/content";
import { SearchPanel } from "./search-panel";

// Destino del botón "Explora ahora" y del ícono de búsqueda móvil (#buscar).
export function SearchSection() {
  return (
    <section id="buscar" aria-labelledby="buscar-titulo" className="py-14 md:py-20">
      <Container className="space-y-8">
        <h2 id="buscar-titulo" className="text-center text-[26px] font-semibold text-ink md:text-4xl">
          {SEARCH_SECTION.title}
        </h2>
        <SearchPanel />
        <p className="text-center text-sm text-ink-2">{SEARCH_SECTION.districtsNote}</p>
      </Container>
    </section>
  );
}
