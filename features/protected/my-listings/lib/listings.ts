// Publicaciones del arrendador: estados, acciones permitidas y montos. Las reglas son las de
// qatu-api (internal/core/domain/listing.go); aquí solo se muestran.
import type { ApiCategory, ApiListing, ApiListingFields, ListingStatus } from "@/lib/api";

export const LISTING_TITLE_MIN = 5;
export const LISTING_TITLE_MAX = 80;
export const LISTING_TEXT_MAX = 2000;
export const ACCESSORIES_MAX = 30;
export const ACCESSORY_MAX = 80;

type Tone = "neutral" | "ok" | "warn" | "danger";

export const STATUS_TEXT: Record<ListingStatus, { label: string; tone: Tone; hint: string }> = {
  draft: { label: "Borrador", tone: "neutral", hint: "Complétala y envíala para publicarla." },
  in_review: { label: "En revisión", tone: "warn", hint: "La estamos revisando. Te avisaremos por correo." },
  published: { label: "Publicada", tone: "ok", hint: "Aparece en Qatu y pueden reservarla." },
  paused: { label: "Pausada", tone: "neutral", hint: "No aparece en Qatu hasta que la reanudes." },
  rejected: { label: "Por corregir", tone: "danger", hint: "Corrígela según el motivo y vuelve a enviarla." },
  archived: { label: "Archivada", tone: "neutral", hint: "Salió de Qatu para siempre." },
};

export type ListingAction = "submit" | "pause" | "resume" | "archive" | "duplicate";

export const ACTION_TEXT: Record<ListingAction, { label: string; done: string }> = {
  submit: { label: "Enviar a publicar", done: "Enviada." },
  pause: { label: "Pausar", done: "Pausada." },
  resume: { label: "Reanudar", done: "Publicada de nuevo." },
  archive: { label: "Archivar", done: "Archivada." },
  duplicate: { label: "Duplicar", done: "Creamos una copia como borrador." },
};

/** Acciones que admite cada estado (la misma máquina de estados de qatu-api). */
export function listingActions(status: ListingStatus): ListingAction[] {
  switch (status) {
    case "draft":
    case "rejected":
      return ["submit", "duplicate", "archive"];
    case "published":
      return ["pause", "duplicate", "archive"];
    case "paused":
      return ["resume", "duplicate", "archive"];
    case "in_review":
    case "archived":
      return ["duplicate"];
  }
}

/** Se edita en borrador, publicada, pausada o por corregir (en revisión se congela). */
export function isEditable(status: ListingStatus): boolean {
  return status === "draft" || status === "published" || status === "paused" || status === "rejected";
}

const soles = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });

/** 3500 → "S/ 35.00". Los montos viajan en céntimos enteros. */
export function formatSoles(cents: number): string {
  return soles.format(cents / 100);
}

/**
 * "35", "35.5" o "35,50" → 3550 céntimos, sin coma flotante. undefined si no es un monto válido
 * (negativo, más de 2 decimales o más de S/ 100 000).
 */
export function solesToCents(raw: string): number | undefined {
  const text = raw.trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return undefined;
  const [whole, decimals = ""] = text.split(".");
  const cents = Number(whole) * 100 + Number(decimals.padEnd(2, "0"));
  return cents <= 100_000_00 ? cents : undefined;
}

/** 3550 → "35.50"; 0 → "" (campo vacío = no se ofrece). */
export function centsToInput(cents: number): string {
  return cents > 0 ? (cents / 100).toFixed(2) : "";
}

/** Lo que el asistente vuelve a enviar completo en cada guardado (PUT con la versión). */
export function listingFields(l: ApiListing): ApiListingFields {
  return {
    category_id: l.category_id,
    title: l.title,
    description: l.description ?? "",
    attributes: l.attributes ?? {},
    replacement_value: l.replacement_value,
    deposit: l.deposit,
    prices: l.prices,
    accessories: l.accessories,
    usage_instructions: l.usage_instructions ?? "",
    pickup_enabled: l.pickup_enabled,
    pickup_location: l.pickup_location,
    delivery_enabled: l.delivery_enabled,
    delivery_fee: l.delivery_fee,
    delivery_zone_ids: l.delivery_zone_ids,
    booking_mode: l.booking_mode,
    cancel_policy: l.cancel_policy,
    min_verification: l.min_verification,
    min_notice_hours: l.min_notice_hours,
    min_duration_hours: l.min_duration_hours,
    max_duration_hours: l.max_duration_hours,
  };
}

/** Tipos de herramienta para elegir: "Construcción · Rotomartillo" (solo se publica en un tipo). */
export function toolTypeOptions(roots: ApiCategory[]): { value: string; label: string }[] {
  return roots.flatMap((root) => (root.children ?? []).map((c) => ({ value: c.id, label: `${root.name} · ${c.name}` })));
}

/** El tipo y su categoría raíz, para mostrar el nombre y leer su esquema de atributos. */
export function findToolType(roots: ApiCategory[], id: string): { root: ApiCategory; type: ApiCategory } | undefined {
  for (const root of roots) {
    const type = root.children?.find((c) => c.id === id);
    if (type) return { root, type };
  }
  return undefined;
}

/** Accesorios escritos uno por línea: sin vacíos ni repetidos (qatu-api vuelve a limpiarlos). */
export function parseAccessories(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of text.split("\n")) {
    const item = line.trim().replace(/\s+/g, " ");
    const key = item.toLocaleLowerCase("es-PE");
    if (!item || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

// Reglas de la publicación (docs/02, A7, y docs/05, niveles de verificación).

export const BOOKING_MODES = [
  { value: "request", label: "Por solicitud", hint: "Revisas cada pedido y lo aceptas o rechazas." },
  { value: "instant", label: "Inmediata", hint: "Se confirma sola si las fechas están libres." },
] as const;

export const CANCEL_POLICIES = [
  { value: "flexible", label: "Flexible", hint: "Reembolso total si cancelan hasta 24 horas antes." },
  { value: "moderate", label: "Moderada", hint: "Reembolso total hasta 72 horas antes; después, el 50 %." },
  { value: "strict", label: "Estricta", hint: "Reembolso total hasta 7 días antes; después, nada (salvo que la vuelvas a alquilar)." },
] as const;

export const VERIFICATION_LEVELS = [
  { value: 1, label: "Nivel 1", hint: "DNI y selfie validados." },
  { value: 2, label: "Nivel 2", hint: "Nivel 1 más 3 alquileres sin incidencias o un comprobante de domicilio." },
] as const;

/** Nivel mínimo que exige el riesgo de la categoría: el arrendador puede pedir más, nunca menos. */
export function minVerificationFor(risk: "low" | "medium" | "high"): number {
  return risk === "high" ? 2 : 1;
}

/** Opciones en horas para antelación y duraciones (la API admite cualquier valor en rango). */
export const NOTICE_OPTIONS = [0, 2, 6, 12, 24, 48, 72, 168];
export const MIN_DURATION_OPTIONS = [1, 2, 4, 8, 24, 48, 72, 168];
export const MAX_DURATION_OPTIONS = [24, 72, 168, 336, 720, 1440, 2160];

/** 0 → "Sin antelación", 12 → "12 horas", 48 → "2 días", 168 → "1 semana". */
export function formatHours(hours: number): string {
  if (hours === 0) return "Sin antelación";
  if (hours % 168 === 0 && hours >= 168 && hours < 720) return hours === 168 ? "1 semana" : `${hours / 168} semanas`;
  if (hours % 24 === 0) return hours === 24 ? "1 día" : `${hours / 24} días`;
  return hours === 1 ? "1 hora" : `${hours} horas`;
}

/** Las opciones con el valor guardado incluido aunque no esté en la lista. */
export function hourOptions(options: number[], current: number): { value: string; label: string }[] {
  const all = options.includes(current) ? options : [...options, current].sort((a, b) => a - b);
  return all.map((h) => ({ value: String(h), label: formatHours(h) }));
}

export interface ChecklistItem {
  key: "day_price" | "replacement_value" | "fulfillment" | "photos";
  label: string;
  done: boolean;
}

/**
 * Lo que falta para enviar a publicar (lo mismo que revisa qatu-api al enviar; la garantía en rango
 * y los atributos obligatorios los revisa el API).
 */
export function publishChecklist(l: ApiListing, readyPhotos: number): ChecklistItem[] {
  const pickupOk = l.pickup_enabled && l.pickup_location !== null;
  const deliveryOk = l.delivery_enabled && l.delivery_zone_ids.length > 0;
  return [
    { key: "day_price", label: "Precio por día", done: l.prices.day > 0 },
    { key: "replacement_value", label: "Valor de reposición y garantía", done: l.replacement_value > 0 },
    { key: "fulfillment", label: "Recojo con su punto o delivery con distritos", done: pickupOk || deliveryOk },
    { key: "photos", label: `Al menos 3 fotos (tienes ${readyPhotos})`, done: readyPhotos >= 3 },
  ];
}
