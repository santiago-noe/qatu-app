import type { ApiCategory, ApiListing, ApiPhoto, ApiZone } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { findToolType, isEditable, STATUS_TEXT } from "@/features/protected/my-listings/lib/listings";
import { splitPhotos } from "@/features/protected/my-listings/lib/photos";
import { LogisticsSection } from "./logistics-section";
import { PhotosSection } from "./photos-section";
import { PricesSection } from "./prices-section";
import { RulesSection } from "./rules-section";
import { SubmitPanel } from "./submit-panel";
import { ToolSection } from "./tool-section";

const SECTIONS = [
  { id: "herramienta", label: "La herramienta" },
  { id: "fotos", label: "Fotos" },
  { id: "precios", label: "Precios y garantía" },
  { id: "entrega", label: "Entrega" },
  { id: "reglas", label: "Reglas" },
];

interface ListingEditorProps {
  listing: ApiListing;
  categories: ApiCategory[];
  photos: ApiPhoto[];
  cityCenter: { lat: number; lng: number };
  zones: ApiZone[];
}

// Editor de una publicación (flujo A1 de docs/02): cada sección se guarda por separado mandando el
// formulario completo con la versión leída; al final, la lista de lo que falta y el envío.
export function ListingEditor({ listing, categories, photos, cityCenter, zones }: ListingEditorProps) {
  const editable = isEditable(listing.status);
  const status = STATUS_TEXT[listing.status];
  const risk = findToolType(categories, listing.category_id)?.type.risk_level ?? "medium";
  const canSubmit = listing.status === "draft" || listing.status === "rejected";

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[200px_minmax(0,1fr)]">
      <nav aria-label="Secciones de la publicación" className="lg:sticky lg:top-6">
        <ol className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
          {SECTIONS.map((s, i) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="inline-flex rounded-full border border-line bg-bg px-3 py-1.5 text-sm text-ink-2 hover:text-ink lg:w-full lg:rounded-[var(--radius-control)] lg:border-transparent lg:bg-transparent"
              >
                {i + 1}. {s.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="flex min-w-0 max-w-3xl flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border border-line bg-bg p-4">
          <Badge tone={status.tone}>{status.label}</Badge>
          <p className="min-w-0 flex-1 text-sm text-ink-2">{status.hint}</p>
        </div>
        {listing.status === "rejected" && listing.rejection_reason && (
          <p className="rounded-[var(--radius-card)] border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <span className="font-medium">Motivo de la revisión: </span>
            {listing.rejection_reason}
          </p>
        )}

        <ToolSection listing={listing} categories={categories} editable={editable} />
        <PhotosSection listing={listing} photos={photos} editable={editable} />
        <PricesSection listing={listing} editable={editable} />
        <LogisticsSection listing={listing} editable={editable} cityCenter={cityCenter} zones={zones} />
        <RulesSection listing={listing} editable={editable} risk={risk} />
        {canSubmit && <SubmitPanel listing={listing} readyPhotos={splitPhotos(photos).ready} />}
      </div>
    </div>
  );
}
