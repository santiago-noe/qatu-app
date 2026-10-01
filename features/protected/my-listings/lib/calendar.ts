// Calendario del arrendador: se bloquean días completos en la hora de Lima (UTC−5 todo el año, sin
// horario de verano). qatu-api guarda [inicio, fin): el fin es el comienzo del día siguiente.
import type { ApiBlock } from "@/lib/api";

const LIMA_OFFSET = "-05:00";
const TIME_ZONE = "America/Lima";

const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" });

const pad = (n: number) => String(n).padStart(2, "0");

/** Día del calendario (fecha local que entrega el selector) → inicio de ese día en Lima, en RFC 3339. */
export function limaDayStart(day: Date): string {
  return `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}T00:00:00${LIMA_OFFSET}`;
}

/** Del día from al día to, ambos incluidos: el fin es el comienzo del día siguiente a to. */
export function blockRequest(from: Date, to: Date): { start: string; end: string } {
  const after = new Date(to.getFullYear(), to.getMonth(), to.getDate() + 1);
  return { start: limaDayStart(from), end: limaDayStart(after) };
}

/** Instante → día de Lima como fecha local (medianoche), para marcarlo en el selector. */
export function limaDay(instant: string | Date): Date {
  const [y, m, d] = ymd.format(new Date(instant)).split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Días ocupados de cada bloqueo (el fin no se incluye: se resta un instante). */
export function blockedRanges(blocks: ApiBlock[]): { from: Date; to: Date }[] {
  return blocks.map((b) => ({ from: limaDay(b.start), to: limaDay(new Date(new Date(b.end).getTime() - 1)) }));
}

const dayMonth = new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "long", timeZone: TIME_ZONE });

/** "5 de octubre" o "5 de octubre al 8 de octubre". */
export function formatBlock(b: ApiBlock): string {
  const from = dayMonth.format(new Date(b.start));
  const to = dayMonth.format(new Date(new Date(b.end).getTime() - 1));
  return from === to ? from : `${from} al ${to}`;
}

export const BLOCK_REASON: Record<ApiBlock["reason"], string> = {
  manual: "Bloqueado por ti",
  booking: "Reserva",
  hold: "Reserva en curso",
};

/** Ventana que se muestra: desde hoy hasta un año (la API admite hasta 13 meses). */
export function calendarWindow(now: Date): { from: string; to: string } {
  const today = limaDay(now);
  const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
  return { from: limaDayStart(today), to: limaDayStart(nextYear) };
}
