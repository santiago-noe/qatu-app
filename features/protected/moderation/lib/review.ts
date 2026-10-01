// Lo que el moderador revisa de una publicación, en texto legible (montos, reglas y atributos).
import type { ApiReviewItem } from "@/lib/api";
import { attributeFields } from "@/lib/attributes";
import { BOOKING_MODES, CANCEL_POLICIES, formatHours, VERIFICATION_LEVELS } from "@/lib/listing-rules";
import { formatSoles } from "@/lib/money";

export const REJECTION_REASON_MAX = 500;

export interface Fact {
  label: string;
  value: string;
}

const PRICE_LABELS = [
  ["hour", "Por hora"],
  ["day", "Por día"],
  ["weekend", "Fin de semana"],
  ["week", "Por semana"],
  ["month", "Por mes"],
] as const;

const labelOf = (list: readonly { value: string | number; label: string }[], value: string | number) =>
  list.find((o) => o.value === value)?.label ?? String(value);

/** Precios, garantía, entrega y reglas. */
export function reviewFacts({ listing: l }: ApiReviewItem, zoneName: (id: string) => string | undefined): Fact[] {
  const prices = PRICE_LABELS.filter(([key]) => l.prices[key] > 0).map(([key, label]) => `${label}: ${formatSoles(l.prices[key])}`);
  const delivery = l.delivery_enabled
    ? `Delivery (${l.delivery_fee > 0 ? formatSoles(l.delivery_fee) : "gratis"}) a ${l.delivery_zone_ids.map((id) => zoneName(id) ?? "un distrito").join(", ")}`
    : "";
  return [
    { label: "Precios", value: prices.join(" · ") || "Sin precios" },
    { label: "Valor de reposición", value: formatSoles(l.replacement_value) },
    { label: "Garantía", value: l.deposit > 0 ? formatSoles(l.deposit) : "Sin garantía" },
    { label: "Entrega", value: [l.pickup_enabled ? "Recojo" : "", delivery].filter(Boolean).join(" · ") },
    { label: "Reserva", value: labelOf(BOOKING_MODES, l.booking_mode) },
    { label: "Cancelación", value: labelOf(CANCEL_POLICIES, l.cancel_policy) },
    { label: "Verificación mínima", value: labelOf(VERIFICATION_LEVELS, l.min_verification) },
    { label: "Antelación", value: formatHours(l.min_notice_hours) },
    { label: "Duración", value: `De ${formatHours(l.min_duration_hours)} a ${formatHours(l.max_duration_hours)}` },
  ];
}

/** Atributos con la etiqueta de su categoría; un valor de lista cerrada se muestra con su texto. */
export function reviewAttributes(item: ApiReviewItem): Fact[] {
  const values = item.listing.attributes ?? {};
  return attributeFields(item.category.attributes_schema).flatMap((f) => {
    const raw = values[f.name];
    if (raw === undefined || raw === null || raw === "") return [];
    if (f.kind === "boolean") return [{ label: f.label, value: raw ? "Sí" : "No" }];
    const option = f.options?.find((o) => o.value === String(raw));
    return [{ label: f.label, value: option?.label ?? String(raw) }];
  });
}

/** Motivo del rechazo: obligatorio y corto (lo lee el arrendador). */
export function rejectionError(reason: string): string | undefined {
  const text = reason.trim();
  if (!text) return "Escribe el motivo: el arrendador lo leerá para corregir su publicación.";
  if (text.length > REJECTION_REASON_MAX) return `Como máximo ${REJECTION_REASON_MAX} caracteres.`;
  return undefined;
}
