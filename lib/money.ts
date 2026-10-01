// Montos en soles (PEN). Viajan en céntimos enteros: nunca decimales para dinero.

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
