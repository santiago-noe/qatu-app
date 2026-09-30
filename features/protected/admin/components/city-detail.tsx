"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ApiAdminCity, ApiAdminZone } from "@/lib/api";
import { useAdminAction } from "@/features/protected/admin/lib/use-admin-action";
import { ActionStatus } from "./action-status";
import { Badge } from "./badge";
import { CityForm } from "./city-form";
import { ZoneForm } from "./zone-form";
import { ZonesMap } from "./zones-map";

type Editing = { mode: "city" } | { mode: "zone"; slug: string } | { mode: "new-zone" } | null;

// Una ciudad y sus distritos: datos de la ciudad, mapa de límites y alta o edición de distritos.
// Pasos para una ciudad nueva: agregar sus distritos con límite y después encenderla.
export function CityDetail({ city, zones }: { city: ApiAdminCity; zones: ApiAdminZone[] }) {
  const { run, pending, alert, notice, setNotice } = useAdminAction();
  const [editing, setEditing] = useState<Editing>(null);
  const activeZones = zones.filter((z) => z.enabled).length;

  function done(message: string) {
    setEditing(null);
    setNotice(message);
  }

  async function toggleCity() {
    const enabled = !city.enabled;
    if (!enabled && !window.confirm(`¿Apagar ${city.name}? Su catálogo y sus distritos dejarán de mostrarse al público.`)) return;
    await run(`/cities/${city.slug}`, { method: "PATCH", body: { enabled }, success: `${city.name}: ${enabled ? "encendida" : "apagada"}.` });
  }

  async function toggleZone(zone: ApiAdminZone) {
    const enabled = !zone.enabled;
    await run(`/cities/${city.slug}/zones/${zone.slug}`, {
      method: "PATCH",
      body: { enabled },
      success: `${zone.name}: ${enabled ? "activo" : "apagado"}.`,
    });
  }

  const editingZone = editing?.mode === "zone" ? editing.slug : undefined;
  const card = "rounded-[var(--radius-card)] border border-line bg-bg p-5 shadow-[var(--shadow-card)]";

  return (
    <div className="flex flex-col gap-6">
      <ActionStatus alert={alert} notice={notice} />

      <section aria-labelledby="ciudad-datos" className={card}>
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="ciudad-datos" className="mr-auto text-lg font-semibold">
            {city.name} <span className="font-normal text-ink-2">· {city.region}</span>
          </h2>
          <Badge tone={city.enabled ? "ok" : "neutral"}>{city.enabled ? "Activa" : "Apagada"}</Badge>
          <Button type="button" variant="outline" size="sm" onClick={() => setEditing(editing?.mode === "city" ? null : { mode: "city" })} aria-expanded={editing?.mode === "city"}>
            Editar datos
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={pending} onClick={toggleCity}>
            {city.enabled ? "Apagar ciudad" : "Encender ciudad"}
          </Button>
        </div>
        {!city.enabled && activeZones === 0 && (
          <p className="mt-2 text-sm text-ink-2">Agrega al menos un distrito activo para poder encenderla.</p>
        )}
        {editing?.mode === "city" && (
          <CityForm city={city} onDone={() => done("Guardamos los datos de la ciudad.")} onCancel={() => setEditing(null)} className="mt-4" />
        )}
      </section>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section aria-labelledby="ciudad-distritos" className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="ciudad-distritos" className="text-lg font-semibold">
              Distritos <span className="font-normal text-ink-2">({zones.length})</span>
            </h2>
            <Button
              type="button"
              onClick={() => setEditing(editing?.mode === "new-zone" ? null : { mode: "new-zone" })}
              aria-expanded={editing?.mode === "new-zone"}
              className="h-10 rounded-[var(--radius-control)]"
            >
              <Plus strokeWidth={1.75} aria-hidden />
              Agregar distrito
            </Button>
          </div>
          {editing?.mode === "new-zone" && (
            <ZoneForm city={city} onDone={done} onCancel={() => setEditing(null)} className={card} />
          )}
          <ul className="flex flex-col divide-y divide-line rounded-[var(--radius-card)] border border-line bg-bg px-4 shadow-[var(--shadow-card)]">
            {zones.length === 0 && <li className="py-6 text-center text-sm text-ink-2">Todavía no tiene distritos.</li>}
            {zones.map((zone) => (
              <li key={zone.id} className="py-3">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <div className="min-w-0 flex-1 basis-40">
                    <p className={zone.enabled ? "font-medium" : "font-medium text-ink-3"}>{zone.name}</p>
                    <p className="font-mono text-xs text-ink-3">
                      {zone.slug}
                      {zone.ubigeo && ` · ${zone.ubigeo}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {!zone.enabled && <Badge>Apagado</Badge>}
                    {!zone.has_boundary && <Badge tone="warn">Sin límite</Badge>}
                  </div>
                  <div className="flex gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing(editingZone === zone.slug ? null : { mode: "zone", slug: zone.slug })}
                      aria-expanded={editingZone === zone.slug}
                      aria-label={`Editar ${zone.name}`}
                    >
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pending}
                      onClick={() => toggleZone(zone)}
                      aria-label={`${zone.enabled ? "Apagar" : "Activar"} ${zone.name}`}
                    >
                      {zone.enabled ? "Apagar" : "Activar"}
                    </Button>
                  </div>
                </div>
                {editingZone === zone.slug && (
                  <ZoneForm
                    key={zone.slug}
                    city={city}
                    zone={zone}
                    onDone={done}
                    onCancel={() => setEditing(null)}
                    className="mt-3 rounded-[var(--radius-card)] border border-line bg-bg-soft p-4"
                  />
                )}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="ciudad-mapa" className="flex min-w-0 flex-col gap-3 lg:sticky lg:top-24">
          <h2 id="ciudad-mapa" className="text-lg font-semibold">
            Mapa de límites
          </h2>
          <ZonesMap cityName={city.name} zones={zones} highlight={editingZone} />
        </section>
      </div>
    </div>
  );
}
