import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DISTRICTS } from "@/features/public/landing/lib/content";
import { toSlug } from "@/features/public/landing/lib/search";

export interface SearchPendingProps {
  tab?: string;
  q?: string;
  zone?: string;
  from?: string;
  to?: string;
  category?: string;
}

// Provisional hasta la feature 005 (búsqueda): conserva y muestra lo que el visitante eligió.
export function SearchPending({ tab, q, zone, from, to, category }: SearchPendingProps) {
  const summary = [
    tab === "hire" ? "Contratar servicios" : "Alquilar herramientas",
    q && `“${q}”`,
    category && `Categoría: ${category}`,
    zone && `Zona: ${DISTRICTS.find((d) => toSlug(d) === zone) ?? zone}`,
    from && `Desde ${from}`,
    to && `Hasta ${to}`,
  ].filter(Boolean) as string[];

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-3xl font-extrabold">La búsqueda llega pronto</h1>
      <p className="text-on-surface-variant">
        Estamos preparando el piloto en Huamanga. Esto es lo que querías buscar:
      </p>
      <ul className="flex flex-wrap justify-center gap-2">
        {summary.map((item) => (
          <li
            key={item}
            className="rounded-full bg-surface-container px-3 py-1 text-sm font-semibold"
          >
            {item}
          </li>
        ))}
      </ul>
      <Button asChild>
        <Link href="/">Volver al inicio</Link>
      </Button>
    </section>
  );
}
