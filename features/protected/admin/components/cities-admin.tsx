"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Plus } from "lucide-react";
import { IconBadge } from "@/components/layout/icon-badge";
import { Button } from "@/components/ui/button";
import type { ApiAdminCity } from "@/lib/api";
import { useAdminAction } from "@/features/protected/admin/lib/use-admin-action";
import { ActionStatus } from "./action-status";
import { Badge } from "./badge";
import { CityForm } from "./city-form";

// Ciudades (feature flag): apagada, su catálogo y sus distritos dejan de mostrarse al público.
// Una ciudad nueva nace apagada; se enciende cuando ya tiene distritos (en su página).
export function CitiesAdmin({ cities }: { cities: ApiAdminCity[] }) {
  const router = useRouter();
  const { run, pending, alert, notice } = useAdminAction();
  const [creating, setCreating] = useState(false);

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
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => setCreating((v) => !v)}
          aria-expanded={creating}
          className="h-10 rounded-[var(--radius-control)]"
        >
          <Plus strokeWidth={1.75} aria-hidden />
          Nueva ciudad
        </Button>
      </div>
      {creating && (
        <div className="rounded-[var(--radius-card)] border border-line bg-bg p-5 shadow-[var(--shadow-card)]">
          <h2 className="mb-4 text-lg font-semibold">Nueva ciudad</h2>
          <CityForm
            onDone={(city) => router.push(`/admin/ciudades/${city.slug}`)}
            onCancel={() => setCreating(false)}
          />
        </div>
      )}
      <ActionStatus alert={alert} notice={notice} />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((city) => (
          <li
            key={city.id}
            className="flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border border-line bg-bg p-4 shadow-[var(--shadow-card)]"
          >
            <IconBadge icon={MapPin} size="sm" />
            <div className="min-w-0 flex-1">
              <Link href={`/admin/ciudades/${city.slug}`} className="font-medium underline-offset-4 hover:underline">
                {city.name}
              </Link>
              <p className="text-sm text-ink-2">{city.region}</p>
            </div>
            <Badge tone={city.enabled ? "ok" : "neutral"}>{city.enabled ? "Activa" : "Apagada"}</Badge>
            <div className="flex w-full gap-1.5">
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/ciudades/${city.slug}`} aria-label={`Distritos de ${city.name}`}>
                  Distritos
                </Link>
              </Button>
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
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
