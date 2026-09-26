"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Hammer, HardHat, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { DISTRICTS, SEARCH_TABS } from "../lib/content";
import {
  ALL_ZONES,
  buildSearchUrl,
  toSlug,
  validateDates,
  type SearchTab,
} from "../lib/search";

const TAB_ICONS = { rent: HardHat, hire: Hammer } as const;

const segment =
  "flex flex-1 flex-col gap-0.5 px-5 py-3 text-left md:py-2.5 focus-within:bg-surface-low";
const segmentLabel = "text-[11px] font-bold uppercase tracking-wide";
const segmentInput =
  "w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/70";

export function SearchPanel() {
  const router = useRouter();
  const [tab, setTab] = useState<SearchTab>("rent");
  const [q, setQ] = useState("");
  const [zone, setZone] = useState<string>(ALL_ZONES);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [today, setToday] = useState<string | undefined>(undefined);

  // La fecha mínima se calcula tras el montaje para no desajustar la hidratación.
  useEffect(() => {
    setToday(new Date().toISOString().slice(0, 10));
  }, []);

  const current = SEARCH_TABS[tab];

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const problem = tab === "rent" ? validateDates(from, to) : null;
    setError(problem);
    if (problem) return;
    router.push(buildSearchUrl({ tab, q, zone, from, to }));
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div
        role="tablist"
        aria-label="Tipo de búsqueda"
        className="mb-4 flex justify-center gap-2"
      >
        {(Object.keys(SEARCH_TABS) as SearchTab[]).map((key) => {
          const Icon = TAB_ICONS[key];
          const active = key === tab;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              id={`tab-${key}`}
              aria-selected={active}
              aria-controls="panel-busqueda"
              onClick={() => {
                setTab(key);
                setError(null);
              }}
              className={cn(
                "inline-flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-semibold transition-colors",
                active
                  ? "border-on-surface text-on-surface"
                  : "border-transparent text-on-surface-variant hover:text-on-surface",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {SEARCH_TABS[key].label}
            </button>
          );
        })}
      </div>

      <form
        id="panel-busqueda"
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
        onSubmit={onSubmit}
        className="flex flex-col overflow-hidden rounded-3xl border border-border bg-surface-lowest shadow-[0_6px_24px_rgba(0,0,0,0.08)] md:flex-row md:items-stretch md:divide-x md:divide-border md:rounded-full"
      >
        <label className={cn(segment, "md:flex-[1.6] md:pl-8")}>
          <span className={segmentLabel}>¿Qué necesitas?</span>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={current.placeholder}
            autoComplete="off"
            className={segmentInput}
          />
        </label>

        <label className={segment}>
          <span className={segmentLabel}>Dónde</span>
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className={cn(segmentInput, "cursor-pointer")}
          >
            <option value={ALL_ZONES}>Todo Huamanga</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={toSlug(d)}>
                {d}
              </option>
            ))}
          </select>
        </label>

        {tab === "rent" && (
          <>
            <label className={segment}>
              <span className={segmentLabel}>Desde</span>
              <input
                type="date"
                value={from}
                min={today}
                onChange={(e) => setFrom(e.target.value)}
                className={segmentInput}
              />
            </label>
            <label className={segment}>
              <span className={segmentLabel}>Hasta</span>
              <input
                type="date"
                value={to}
                min={from || today}
                onChange={(e) => setTo(e.target.value)}
                className={segmentInput}
              />
            </label>
          </>
        )}

        <div className="flex items-center justify-end p-2 md:pr-2.5">
          <button
            type="submit"
            aria-label={current.submitLabel}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-container md:w-12 md:px-0"
          >
            <Search className="size-5" aria-hidden />
            <span className="md:sr-only">{current.submitLabel}</span>
          </button>
        </div>
      </form>

      {error && (
        <p role="alert" className="mt-3 text-center text-sm font-semibold text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
