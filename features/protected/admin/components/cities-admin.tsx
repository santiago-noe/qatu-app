"use client";

import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ApiAdminCity } from "@/lib/api";
import { useAdminAction } from "@/features/protected/admin/lib/use-admin-action";
import { ActionStatus } from "./action-status";
import { Badge } from "./badge";

// Ciudades (feature flag): apagada, su catálogo y sus distritos dejan de mostrarse al público.
// Una ciudad nueva se agrega por migración con los límites oficiales de sus distritos.
export function CitiesAdmin({ cities }: { cities: ApiAdminCity[] }) {
  const { run, pending, alert, notice } = useAdminAction();

  async function toggle(city: ApiAdminCity) {
    const enabled = !city.enabled;
    if (!enabled && !window.confirm(`¿Apagar ${city.name}? Su catálogo y sus distritos dejarán de mostrarse al público.`)) return;
    await run(`/cities/${city.slug}`, {
      method: "PATCH",
      body: { enabled },
      success: `${city.name}: ${enabled ? "encendida" : "apagada"}.`,
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <ActionStatus alert={alert} notice={notice} />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((city) => (
          <li key={city.id} className="flex items-center gap-3 rounded-[var(--radius-card)] border border-line bg-bg p-4">
            <MapPin className="size-5 shrink-0 text-ink-2" strokeWidth={1.5} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-medium">{city.name}</p>
              <p className="text-sm text-ink-2">{city.region}</p>
            </div>
            <Badge tone={city.enabled ? "ok" : "neutral"}>{city.enabled ? "Activa" : "Apagada"}</Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => toggle(city)}
              aria-label={`${city.enabled ? "Apagar" : "Encender"} ${city.name}`}
            >
              {city.enabled ? "Apagar" : "Encender"}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
