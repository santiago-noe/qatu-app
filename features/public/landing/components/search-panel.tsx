"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { DateRange } from "react-day-picker";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useOverlay } from "@/hooks/use-overlay";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ApiZone } from "@/lib/api";
import { SEARCH_TABS } from "../lib/content";
import { ALL_ZONES, buildSearchUrl, toIsoDate, validateDates, type SearchTab } from "../lib/search";

// El calendario solo se descarga al abrir "Cuándo".
const DateRangeCalendar = dynamic(() => import("./date-range-calendar"), {
  ssr: false,
  loading: () => <div className="h-[300px] w-[280px]" aria-hidden />,
});

const dateFormat = new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short" });

function formatRange(range: DateRange | undefined): string {
  if (!range?.from) return "";
  const from = dateFormat.format(range.from);
  return range.to ? `${from} – ${dateFormat.format(range.to)}` : `Desde ${from}`;
}

const ALL_ZONES_LABEL = "Todo Huamanga";

const fieldLabel = "text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3";

export function SearchPanel({ zones }: { zones: ApiZone[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<SearchTab>("rent");
  const [q, setQ] = useState("");
  const [zone, setZone] = useState<string>(ALL_ZONES);
  const [range, setRange] = useState<DateRange | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const closeSheet = useCallback(() => setSheetOpen(false), []);
  useOverlay(sheetOpen, closeSheet);
  const wide = useMediaQuery("(min-width: 1024px)");

  const current = SEARCH_TABS[tab];
  const zoneLabel = zones.find((z) => z.slug === zone)?.name ?? ALL_ZONES_LABEL;
  const isRent = tab === "rent";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const from = isRent ? toIsoDate(range?.from) : "";
    const to = isRent ? toIsoDate(range?.to) : "";
    const problem = validateDates(from, to);
    setError(problem);
    if (problem) return;
    setSheetOpen(false);
    router.push(buildSearchUrl({ tab, q, zone, from, to }));
  }

  // Campos definidos una vez y usados en la tarjeta de escritorio y en la hoja móvil.
  const tabs = (
    <div role="tablist" aria-label="Tipo de búsqueda" className="flex gap-6">
      {(Object.keys(SEARCH_TABS) as SearchTab[]).map((key) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={key === tab}
          onClick={() => {
            setTab(key);
            setError(null);
          }}
          className={cn(
            "border-b-2 pb-2 text-sm font-medium transition-colors",
            key === tab ? "border-brand text-ink" : "border-transparent text-ink-2 hover:text-ink",
          )}
        >
          {SEARCH_TABS[key].label}
        </button>
      ))}
    </div>
  );

  const whatField = (
    <label className="flex flex-col gap-1">
      <span className={fieldLabel}>¿Qué necesitas?</span>
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={current.placeholder}
        autoComplete="off"
        className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-3 focus-visible:shadow-none focus-visible:outline-none"
      />
    </label>
  );

  const whereField = (
    <div className="flex flex-col gap-1">
      <span id="label-donde" className={fieldLabel}>
        Dónde
      </span>
      <Select value={zone} onValueChange={setZone}>
        <SelectTrigger
          aria-labelledby="label-donde"
          className="h-auto w-full border-0 bg-transparent p-0 text-[15px] text-ink shadow-none focus-visible:ring-0"
        >
          <SelectValue>{zoneLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_ZONES}>{ALL_ZONES_LABEL}</SelectItem>
          {zones.map((z) => (
            <SelectItem key={z.slug} value={z.slug}>
              {z.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const rangeLabel = formatRange(range);
  const whenValue = (
    <span className={cn("block truncate text-left text-[15px]", rangeLabel ? "text-ink" : "text-ink-3")}>
      {rangeLabel || "Agrega fechas"}
    </span>
  );

  const submitButton = (
    <Button type="submit" className="h-12 w-full gap-2 rounded-[var(--radius-control)] px-6 text-[15px] md:w-auto">
      <Search className="size-4" strokeWidth={1.75} aria-hidden />
      Buscar
    </Button>
  );

  const errorMessage = error && (
    <p role="alert" className="mt-3 text-sm text-destructive">
      {error}
    </p>
  );

  return (
    <div className="mx-auto w-full max-w-[920px]">
      <div className="mb-4 hidden md:block">{tabs}</div>

      {/* Escritorio: tarjeta con segmentos separados por divisores de 1 px */}
      <form
        onSubmit={submit}
        className="hidden items-center rounded-[var(--radius-card)] border border-line bg-bg p-2 shadow-[var(--shadow-card)] md:flex"
      >
        <div className="min-w-0 flex-[1.4] px-4 py-1.5">{whatField}</div>
        <div className="min-w-0 flex-1 border-l border-line px-4 py-1.5">{whereField}</div>
        {isRent && (
          <div className="min-w-0 flex-1 border-l border-line px-4 py-1.5">
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button type="button" className="flex w-full flex-col gap-1 text-left">
                  <span className={fieldLabel}>Cuándo</span>
                  {whenValue}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-auto p-0">
                {calendarOpen && <DateRangeCalendar value={range} onChange={setRange} months={wide ? 2 : 1} />}
              </PopoverContent>
            </Popover>
          </div>
        )}
        <div className="pl-2">{submitButton}</div>
      </form>
      <div className="hidden md:block">{errorMessage}</div>

      {/* Móvil: un solo campo que abre la hoja completa */}
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="flex w-full items-center gap-3 rounded-[var(--radius-card)] border border-line bg-bg px-4 py-3 text-left shadow-[var(--shadow-card)] md:hidden"
      >
        <Search className="size-5 shrink-0 text-ink-2" strokeWidth={1.5} aria-hidden />
        <span className="flex min-w-0 flex-col">
          <span className={fieldLabel}>¿Qué necesitas?</span>
          <span className={cn("truncate text-[15px]", q ? "text-ink" : "text-ink-3")}>{q || current.placeholder}</span>
        </span>
      </button>

      {sheetOpen && (
        <div role="dialog" aria-modal="true" aria-label="Buscar en Qatu" className="fixed inset-0 z-[60] flex flex-col bg-bg md:hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-2">
            <span className="text-sm font-semibold text-ink">Buscar en Qatu</span>
            <button type="button" onClick={closeSheet} aria-label="Cerrar búsqueda" className="-mr-2 inline-flex size-11 items-center justify-center">
              <X className="size-6" strokeWidth={1.5} />
            </button>
          </div>
          <form onSubmit={submit} className="flex flex-1 flex-col overflow-y-auto">
            <div className="flex-1 space-y-4 px-4 py-5">
              {tabs}
              <div className="divide-y divide-line rounded-[var(--radius-card)] border border-line">
                <div className="p-4">{whatField}</div>
                <div className="p-4">{whereField}</div>
                {isRent && (
                  <div className="space-y-2 p-4">
                    <span className={cn(fieldLabel, "block")}>Cuándo</span>
                    {whenValue}
                    <DateRangeCalendar value={range} onChange={setRange} />
                  </div>
                )}
              </div>
              {errorMessage}
            </div>
            <div className="border-t border-line p-4">{submitButton}</div>
          </form>
        </div>
      )}
    </div>
  );
}
