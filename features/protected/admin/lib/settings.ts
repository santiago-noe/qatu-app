// Ajustes de platform_settings que edita el admin. Las claves son las que admite qatu-api
// (internal/core/domain/settings.go); los valores son puntos básicos (1000 = 10 %).
import type { Vertical } from "@/lib/api";

export interface SettingInfo {
  key: string;
  label: string;
  vertical: Vertical;
}

export const SETTINGS: SettingInfo[] = [
  { key: "rental.owner_commission_bps", label: "Comisión al arrendador", vertical: "rental" },
  { key: "rental.client_service_fee_bps", label: "Tarifa de servicio al cliente (alquiler)", vertical: "rental" },
  { key: "service.provider_commission_bps", label: "Comisión al proveedor", vertical: "service" },
  { key: "service.client_service_fee_bps", label: "Tarifa de servicio al cliente (servicios)", vertical: "service" },
];

export const settingInfo = (key: string) => SETTINGS.find((s) => s.key === key);

const PERCENT_SHAPE = /^\d{1,3}([.,]\d{1,2})?$/;

/** "10,5" o "10.5" → 1050 puntos básicos. undefined si no es un porcentaje de 0 a 100 con 2 decimales. */
export function percentToBps(raw: string): number | undefined {
  const text = raw.trim();
  if (!PERCENT_SHAPE.test(text)) return undefined;
  // Con enteros, sin coma flotante: "10.05" es 1005, no 1004,9999.
  const [whole, fraction = ""] = text.split(/[.,]/);
  const bps = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return bps <= 10_000 ? bps : undefined;
}

/** 1050 → "10.5 %" (es-PE usa punto decimal). */
export function formatBps(bps: number): string {
  return `${(bps / 100).toLocaleString("es-PE", { maximumFractionDigits: 2 })} %`;
}

/** 1050 → "10.5", para el valor inicial de un campo. */
export const bpsToInput = (bps: number) => String(bps / 100);

const WHEN = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Lima" });

/** Fecha y hora de un cambio en la hora de Perú. */
export const formatWhen = (iso: string) => WHEN.format(new Date(iso));
