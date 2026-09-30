import type { ApiAdminZone } from "@/lib/api";
import { cn } from "@/lib/utils";
import { zonesMap } from "@/features/protected/admin/lib/places";

interface ZonesMapProps {
  cityName: string;
  zones: ApiAdminZone[];
  /** Distrito resaltado (el que se edita). */
  highlight?: string;
}

// Vista previa de los límites en SVG, sin mapa base: basta para ver que cada distrito quedó en su
// lugar y que no se pisan. Los apagados van punteados.
export function ZonesMap({ cityName, zones, highlight }: ZonesMapProps) {
  const map = zonesMap(zones);
  if (!map) {
    return (
      <p className="rounded-[var(--radius-card)] border border-dashed border-line bg-bg p-6 text-center text-sm text-ink-2">
        Aún no hay distritos con límite. Sin límite, el distrito se elige de la lista pero no se detecta por ubicación.
      </p>
    );
  }
  return (
    <figure className="rounded-[var(--radius-card)] border border-line bg-bg p-3 shadow-[var(--shadow-card)]">
      <svg
        viewBox={map.viewBox}
        role="img"
        aria-label={`Límites de los distritos de ${cityName}`}
        className="mx-auto max-h-[420px] w-full"
      >
        {map.shapes.map((shape) => (
          <path
            key={shape.slug}
            d={shape.d}
            fillRule="evenodd"
            vectorEffect="non-scaling-stroke"
            strokeWidth={highlight === shape.slug ? 3 : 1.5}
            strokeDasharray={shape.enabled ? undefined : "6 4"}
            className={cn(
              "stroke-ink-2",
              highlight === shape.slug ? "fill-brand" : shape.enabled ? "fill-brand-soft" : "fill-bg-soft",
            )}
          >
            <title>
              {shape.name}
              {shape.enabled ? "" : " (apagado)"}
            </title>
          </path>
        ))}
      </svg>
      <figcaption className="mt-2 text-xs text-ink-3">Límites: © colaboradores de OpenStreetMap (ODbL) o la fuente que cargues.</figcaption>
    </figure>
  );
}
