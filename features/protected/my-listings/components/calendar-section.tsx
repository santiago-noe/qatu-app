"use client";

import { useCallback, useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { es } from "react-day-picker/locale";
import { CalendarX2, Trash2 } from "lucide-react";
import { FormAlert, FormNotice } from "@/components/form/form-alert";
import { TextField } from "@/components/form/text-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import type { ApiBlock, ApiListing } from "@/lib/api";
import { callBff } from "@/lib/bff-client";
import { useMediaQuery } from "@/lib/use-media-query";
import {
  BLOCK_REASON,
  blockedRanges,
  blockRequest,
  calendarWindow,
  formatBlock,
  limaDay,
} from "@/features/protected/my-listings/lib/calendar";

const NOTE_MAX = 200;

// Calendario (docs/02, A1 paso 9): el arrendador bloquea días en que no alquila. Las reservas
// (006) también aparecen aquí y no se quitan desde el calendario. Los días van en hora de Lima.
export function CalendarSection({ listing }: { listing: ApiListing }) {
  const wide = useMediaQuery("(min-width: 768px)");
  const editable = listing.status !== "archived";
  const [blocks, setBlocks] = useState<ApiBlock[]>();
  const [range, setRange] = useState<DateRange>();
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [alert, setAlert] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const base = `/api/me/listings/${listing.id}/availability`;
  const today = limaDay(new Date());

  const load = useCallback(async () => {
    const { from, to } = calendarWindow(new Date());
    const result = await callBff<{ blocks: ApiBlock[] }>(`${base}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    if (result.ok) setBlocks(result.data.blocks);
    else setAlert(result.error.message);
  }, [base]);

  useEffect(() => {
    void load();
  }, [load]);

  async function block() {
    if (!range?.from) return;
    setPending(true);
    setAlert(undefined);
    setNotice(undefined);
    const result = await callBff<ApiBlock>(base, {
      method: "POST",
      body: { ...blockRequest(range.from, range.to ?? range.from), note: note.trim() },
    });
    setPending(false);
    if (!result.ok) {
      setAlert(result.error.message);
      return;
    }
    setNotice(`Bloqueamos ${formatBlock(result.data)}.`);
    setRange(undefined);
    setNote("");
    await load();
  }

  async function unblock(b: ApiBlock) {
    setPending(true);
    setAlert(undefined);
    setNotice(undefined);
    const result = await callBff(`${base}/${b.id}`, { method: "DELETE", body: {} });
    setPending(false);
    if (!result.ok) {
      setAlert(result.error.message);
      return;
    }
    setNotice(`Liberamos ${formatBlock(b)}.`);
    await load();
  }

  const taken = blockedRanges(blocks ?? []);

  return (
    <section
      id="calendario"
      aria-labelledby="calendario-titulo"
      className="@container flex scroll-mt-6 flex-col gap-5 rounded-[var(--radius-card)] border border-line bg-bg p-5 sm:p-6"
    >
      <div>
        <h2 id="calendario-titulo" className="text-lg font-semibold">
          Calendario
        </h2>
        <p className="mt-1 text-sm text-ink-2">
          Bloquea los días en que la herramienta no está disponible. Esos días nadie podrá reservarla.
        </p>
      </div>
      <FormAlert>{alert}</FormAlert>
      <FormNotice>{notice}</FormNotice>

      {editable && (
        <div className="flex flex-col gap-4 @3xl:flex-row @3xl:items-start">
          <div className="self-start overflow-x-auto rounded-[var(--radius-control)] border border-line">
            <Calendar
              mode="range"
              locale={es}
              numberOfMonths={wide ? 2 : 1}
              selected={range}
              onSelect={setRange}
              disabled={[{ before: today }, ...taken]}
              modifiers={{ blocked: taken }}
              modifiersClassNames={{ blocked: "[&_button]:line-through [&_button]:text-ink-3" }}
              defaultMonth={today}
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <p className="text-sm text-ink-2" aria-live="polite">
              {range?.from
                ? `Elegiste ${formatBlock({ ...blockRequest(range.from, range.to ?? range.from), id: "", reason: "manual" })}.`
                : "Elige el primer y el último día en el calendario."}
            </p>
            <TextField
              label="Nota para ti (opcional)"
              name="note"
              value={note}
              maxLength={NOTE_MAX}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Mantenimiento, la uso yo…"
            />
            <div>
              <Button type="button" onClick={block} disabled={!range?.from || pending} className="h-11 rounded-[var(--radius-control)]">
                <CalendarX2 strokeWidth={1.75} aria-hidden />
                {pending ? "Guardando…" : "Bloquear estas fechas"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h3 className="font-medium">Días no disponibles</h3>
        {blocks === undefined && <p className="text-sm text-ink-3">Cargando…</p>}
        {blocks?.length === 0 && <p className="text-sm text-ink-2">No hay días bloqueados en el próximo año.</p>}
        <ul className="flex flex-col divide-y divide-line">
          {blocks?.map((b) => (
            <li key={b.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
              <span className="font-medium">{formatBlock(b)}</span>
              <Badge tone={b.reason === "manual" ? "neutral" : "ok"}>{BLOCK_REASON[b.reason]}</Badge>
              {b.note && <span className="text-sm text-ink-2">{b.note}</span>}
              {editable && b.reason === "manual" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  disabled={pending}
                  onClick={() => unblock(b)}
                  aria-label={`Liberar ${formatBlock(b)}`}
                >
                  <Trash2 strokeWidth={1.75} aria-hidden />
                  Liberar
                </Button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
