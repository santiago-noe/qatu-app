// Textos de las reglas de una publicación, compartidos por el arrendador y moderación
// (docs/02, A7, y docs/05, niveles de verificación).

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

/** 0 → "Sin antelación", 12 → "12 horas", 48 → "2 días", 168 → "1 semana". */
export function formatHours(hours: number): string {
  if (hours === 0) return "Sin antelación";
  if (hours % 168 === 0 && hours >= 168 && hours < 720) return hours === 168 ? "1 semana" : `${hours / 168} semanas`;
  if (hours % 24 === 0) return hours === 24 ? "1 día" : `${hours / 24} días`;
  return hours === 1 ? "1 hora" : `${hours} horas`;
}
