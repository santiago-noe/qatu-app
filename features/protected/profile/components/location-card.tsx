"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Building2, LocateFixed, MapPin } from "lucide-react";
import { FormAlert } from "@/components/form/form-alert";
import { SelectField } from "@/components/form/select-field";
import { Button } from "@/components/ui/button";
import type { ApiCity, ApiLocation, ApiZone } from "@/lib/api";
import { callBff } from "@/lib/bff-client";
import { currentPosition } from "@/features/protected/profile/lib/geolocation";

export interface CityZones {
  city: ApiCity;
  zones: ApiZone[];
}

interface LocationCardProps {
  cities: CityZones[];
  /** Ubicación guardada; null si aún no eligió (o su distrito se deshabilitó). */
  current: ApiLocation | null;
}

type Status = "idle" | "locating" | "saving";

// Ciudad y distrito del usuario: se elige de la lista o se detecta con la ubicación del navegador
// (spec 002). Se guarda solo el distrito, nunca el punto exacto.
export function LocationCard({ cities, current }: LocationCardProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(current === null);
  const [citySlug, setCitySlug] = useState(current?.city.slug ?? cities[0]?.city.slug ?? "");
  const [zoneSlug, setZoneSlug] = useState(current?.zone.slug ?? "");
  const [status, setStatus] = useState<Status>("idle");
  const [alert, setAlert] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const zones = cities.find((c) => c.city.slug === citySlug)?.zones ?? [];

  async function detect() {
    setAlert(undefined);
    setNotice(undefined);
    setStatus("locating");
    try {
      const { lat, lng } = await currentPosition();
      const result = await callBff<ApiLocation>(`/api/geo/zone?lat=${lat}&lng=${lng}`);
      if (result.ok) {
        setCitySlug(result.data.city.slug);
        setZoneSlug(result.data.zone.slug);
        setNotice(`Estás en ${result.data.zone.name}. Revisa y guarda.`);
      } else {
        setAlert(result.error.message);
      }
    } catch (err) {
      setAlert((err as Error).message);
    } finally {
      setStatus("idle");
    }
  }

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotice(undefined);
    if (!zoneSlug) {
      setAlert("Elige tu distrito.");
      return;
    }
    setAlert(undefined);
    setStatus("saving");
    const result = await callBff("/api/me/location", { method: "PUT", body: { city: citySlug, zone: zoneSlug } });
    setStatus("idle");
    if (!result.ok) {
      setAlert(result.error.message);
      return;
    }
    setEditing(false);
    router.refresh(); // el Server Component vuelve a leer la ubicación guardada
  }

  return (
    <section aria-labelledby="tu-distrito" className="rounded-[var(--radius-card)] border border-line bg-bg p-5">
      <h2 id="tu-distrito" className="text-base font-semibold">
        Tu distrito
      </h2>
      <p className="mt-1 text-sm text-ink-2">
        Lo usamos para mostrarte herramientas y técnicos cerca de ti. Solo guardamos el distrito, nunca tu ubicación
        exacta.
      </p>

      {!editing && current ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-[15px] font-medium text-ink">
            <MapPin className="size-5 text-brand-text" strokeWidth={1.75} aria-hidden />
            {current.zone.name}, {current.city.name}
          </p>
          <Button type="button" variant="outline" className="h-10 rounded-[var(--radius-control)]" onClick={() => setEditing(true)}>
            Cambiar
          </Button>
        </div>
      ) : (
        <form onSubmit={save} className="mt-4 flex flex-col gap-3.5" noValidate>
          <FormAlert>{alert}</FormAlert>
          {notice && (
            <p role="status" className="rounded-[var(--radius-control)] bg-brand-soft px-3 py-2.5 text-sm text-ink">
              {notice}
            </p>
          )}
          {cities.length > 1 && (
            <SelectField
              label="Ciudad"
              icon={Building2}
              value={citySlug}
              onChange={(e) => {
                setCitySlug(e.target.value);
                setZoneSlug("");
              }}
              options={cities.map(({ city }) => ({ value: city.slug, label: city.name }))}
            />
          )}
          <SelectField
            label="Distrito"
            icon={MapPin}
            placeholder="Elige tu distrito"
            value={zoneSlug}
            onChange={(e) => setZoneSlug(e.target.value)}
            options={zones.map((z) => ({ value: z.slug, label: z.name }))}
          />
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={detect}
              disabled={status !== "idle"}
              className="h-11 rounded-[var(--radius-control)] sm:flex-1"
            >
              <LocateFixed strokeWidth={1.75} aria-hidden />
              {status === "locating" ? "Buscando tu distrito…" : "Usar mi ubicación"}
            </Button>
            <Button type="submit" disabled={status !== "idle"} className="h-11 rounded-[var(--radius-control)] sm:flex-1">
              {status === "saving" ? "Guardando…" : "Guardar distrito"}
            </Button>
          </div>
          {current && (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="self-start text-sm font-medium text-ink-2 underline-offset-4 hover:underline"
            >
              Cancelar
            </button>
          )}
        </form>
      )}
    </section>
  );
}
