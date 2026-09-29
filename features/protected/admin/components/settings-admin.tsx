"use client";

import { useState } from "react";
import { History, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ApiAdminCategory, ApiAdminCity, ApiSetting, ApiSettingChange, Vertical } from "@/lib/api";
import { flattenTree } from "@/features/protected/admin/lib/categories";
import { formatBps, formatWhen, SETTINGS, type SettingInfo } from "@/features/protected/admin/lib/settings";
import { useAdminAction } from "@/features/protected/admin/lib/use-admin-action";
import { ActionStatus } from "./action-status";
import { SettingValueForm, type Scope } from "./setting-value-form";

interface SettingsAdminProps {
  settings: ApiSetting[];
  cities: ApiAdminCity[];
  categories: Record<Vertical, ApiAdminCategory[]>;
  /** Para mostrar "Tú" en el historial. */
  meId: string;
}

// Comisiones y tarifas (platform_settings): un valor global y, si hace falta, otros por ciudad o
// categoría (gana el más específico). Cada cambio queda en el historial y solo afecta lo nuevo.
export function SettingsAdmin({ settings, cities, categories, meId }: SettingsAdminProps) {
  return (
    <div className="grid items-start gap-4 lg:grid-cols-2">
      {SETTINGS.map((info) => (
        <SettingCard
          key={info.key}
          info={info}
          values={settings.filter((s) => s.key === info.key)}
          cities={cities}
          categories={categories[info.vertical]}
          meId={meId}
        />
      ))}
    </div>
  );
}

interface SettingCardProps {
  info: SettingInfo;
  values: ApiSetting[];
  cities: ApiAdminCity[];
  categories: ApiAdminCategory[];
  meId: string;
}

function SettingCard({ info, values, cities, categories, meId }: SettingCardProps) {
  const { run, pending, alert, notice, setNotice } = useAdminAction();
  const [editing, setEditing] = useState<string | null>(null); // id del valor, "new" o null
  const [history, setHistory] = useState<ApiSettingChange[] | null>(null);

  const flat = flattenTree(categories);
  const cityById = (id?: string) => cities.find((c) => c.id === id);
  const cityBySlug = (slug?: string) => cities.find((c) => c.slug === slug);
  const categoryName = (id?: string) => flat.find((f) => f.category.id === id)?.category.name;

  function scopeLabel(cityName?: string, category?: string) {
    const parts = [cityName, category].filter(Boolean);
    return parts.length ? parts.join(" · ") : "General (todas las ciudades y categorías)";
  }

  // El valor general primero; luego los específicos por nombre.
  const rows = values
    .map((s) => ({ setting: s, label: scopeLabel(cityById(s.city_id)?.name, categoryName(s.category_id)) }))
    .sort((a, b) => Number(Boolean(a.setting.city_id || a.setting.category_id)) - Number(Boolean(b.setting.city_id || b.setting.category_id)) || a.label.localeCompare(b.label));

  async function toggleHistory() {
    if (history) return setHistory(null);
    const result = await run<{ history: ApiSettingChange[] }>(`/settings/${info.key}/history?limit=20`);
    if (result.ok) setHistory(result.data.history);
  }

  function saved() {
    setEditing(null);
    setHistory(null); // se vuelve a pedir con el cambio nuevo
    setNotice("Guardado. Solo afecta a las transacciones que se creen desde ahora.");
  }

  const scopeOf = (s: ApiSetting): Scope => ({ city: cityById(s.city_id)?.slug ?? "", categoryId: s.category_id ?? "" });

  return (
    <section aria-labelledby={`ajuste-${info.key}`} className="rounded-[var(--radius-card)] border border-line bg-bg p-4 sm:p-5">
      <h2 id={`ajuste-${info.key}`} className="text-base font-semibold">
        {info.label}
      </h2>
      <p className="font-mono text-xs text-ink-3">{info.key}</p>

      <div className="mt-3">
        <ActionStatus alert={alert} notice={notice} />
      </div>

      {rows.length === 0 && <p className="mt-3 text-sm text-ink-2">Sin valor todavía.</p>}
      <ul className="mt-2 divide-y divide-line">
        {rows.map(({ setting, label }) => (
          <li key={setting.id} className="py-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink-2">{label}</p>
                <p className="text-xl font-semibold tabular-nums">{formatBps(setting.value)}</p>
                <p className="text-xs text-ink-3">
                  Versión {setting.version} · {formatWhen(setting.updated_at)}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditing(editing === setting.id ? null : setting.id)}
                aria-expanded={editing === setting.id}
                aria-label={`Cambiar ${info.label}: ${label}`}
              >
                Cambiar
              </Button>
            </div>
            {editing === setting.id && (
              <SettingValueForm
                settingKey={info.key}
                scope={scopeOf(setting)}
                initialBps={setting.value}
                onDone={saved}
                onCancel={() => setEditing(null)}
              />
            )}
          </li>
        ))}
      </ul>

      <div className="mt-2 flex flex-wrap gap-2 border-t border-line pt-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setEditing(editing === "new" ? null : "new")}
          aria-expanded={editing === "new"}
          className="text-brand-text"
        >
          <Plus strokeWidth={1.75} aria-hidden />
          Valor para una ciudad o categoría
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={toggleHistory} disabled={pending} aria-expanded={Boolean(history)}>
          <History strokeWidth={1.5} aria-hidden />
          {history ? "Ocultar historial" : "Ver historial"}
        </Button>
      </div>

      {editing === "new" && (
        <SettingValueForm
          settingKey={info.key}
          cities={cities}
          categories={flat}
          onDone={saved}
          onCancel={() => setEditing(null)}
        />
      )}

      {history && (
        <div className="mt-3">
          <h3 className="text-sm font-semibold">Historial</h3>
          {history.length === 0 ? (
            <p className="mt-1 text-sm text-ink-2">Sin cambios registrados.</p>
          ) : (
            <ol className="mt-2 flex flex-col gap-2 text-sm">
              {history.map((change, i) => (
                <li key={`${change.at}-${i}`} className="rounded-[var(--radius-control)] bg-bg-soft px-3 py-2">
                  <p className="font-medium tabular-nums">
                    {change.before ? `${formatBps(change.before.value)} → ` : "Creado: "}
                    {formatBps(change.after.value)}
                  </p>
                  <p className="text-xs text-ink-2">
                    {scopeLabel(cityBySlug(change.after.city)?.name, categoryName(change.after.category_id))} ·{" "}
                    {change.actor_id === meId ? "Tú" : change.actor_id ? "Otro administrador" : "Sistema"} ·{" "}
                    {formatWhen(change.at)}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </section>
  );
}
