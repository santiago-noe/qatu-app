"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FormAlert } from "@/components/form/form-alert";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import type { ApiAdminCity, ApiAdminZone } from "@/lib/api";
import { cn } from "@/lib/utils";
import { slugify } from "@/features/protected/admin/lib/categories";
import {
  PLACE_NAME_MAX,
  placeFieldForError,
  readBoundaryFile,
  validateZone,
  ZONE_FIELDS,
  type ZoneField,
} from "@/features/protected/admin/lib/places";
import { useAdminAction } from "@/features/protected/admin/lib/use-admin-action";

// Tope del archivo: un distrito de OSM pesa decenas de KB; qatu-api acepta hasta 20 000 vértices.
const MAX_FILE_BYTES = 2 * 1024 * 1024;

interface ZoneFormProps {
  city: ApiAdminCity;
  /** Al editar, el distrito (identificador y ubigeo fijos); al crear, undefined. */
  zone?: ApiAdminZone;
  onDone(message: string): void;
  onCancel(): void;
  className?: string;
}

// Alta o edición de un distrito con su límite en GeoJSON (archivo). qatu-api revisa la geometría,
// que caiga en la ciudad y que no repita otro distrito.
export function ZoneForm({ city, zone, onDone, onCancel, className }: ZoneFormProps) {
  const fileHintId = useId();
  const { run, pending, alert, setAlert } = useAdminAction();
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Partial<Record<ZoneField, string>>>({});
  const [name, setName] = useState(zone?.name ?? "");
  const [slug, setSlug] = useState(zone?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(zone));

  useEffect(() => {
    formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
  }, [errors]);

  async function readBoundary(file: File | null): Promise<{ boundary?: unknown; error?: string }> {
    if (!file || file.size === 0) return {};
    if (file.size > MAX_FILE_BYTES) return { error: "El archivo pesa más de 2 MB: simplifica el límite antes de subirlo." };
    const boundary = readBoundaryFile(await file.text());
    return boundary ? { boundary } : { error: "No es un GeoJSON de polígono (Polygon, MultiPolygon o Feature)." };
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const text = (key: string) => String(form.get(key) ?? "");
    const draft = { slug, name, ubigeo: zone?.ubigeo ?? text("ubigeo"), sortOrder: text("sort_order") };
    const { boundary, error: fileError } = await readBoundary(form.get("boundary") as File | null);
    const clientErrors = { ...validateZone(draft, city.ubigeo), ...(fileError && { boundary: fileError }) };
    setErrors(clientErrors);
    setAlert(undefined);
    if (Object.keys(clientErrors).length > 0) return;

    const fields = { name: draft.name.trim(), sort_order: Number(draft.sortOrder), ...(boundary !== undefined && { boundary }) };
    const result = zone
      ? await run(`/cities/${city.slug}/zones/${zone.slug}`, { method: "PATCH", body: fields })
      : await run(`/cities/${city.slug}/zones`, {
          method: "POST",
          body: { ...fields, slug: draft.slug.trim(), ubigeo: draft.ubigeo.trim() },
        });
    if (result.ok) return onDone(zone ? `Guardamos «${fields.name}».` : `Agregamos «${fields.name}».`);

    const field = placeFieldForError(result.error.error, ZONE_FIELDS);
    if (field) {
      setAlert(undefined);
      setErrors({ [field]: result.error.message });
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className={cn("@container flex flex-col gap-4", className)}>
      <FormAlert>{alert}</FormAlert>
      <div className="grid gap-4 @md:grid-cols-2">
        <TextField
          label="Nombre"
          name="name"
          value={name}
          maxLength={PLACE_NAME_MAX}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          autoFocus
          error={errors.name}
        />
        <TextField
          label="Identificador"
          name="slug"
          value={slug}
          readOnly={Boolean(zone)}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugTouched(true);
          }}
          className="[&_input]:font-mono"
          error={errors.slug}
        />
        <TextField
          label="Ubigeo del distrito (opcional)"
          name="ubigeo"
          defaultValue={zone?.ubigeo}
          readOnly={Boolean(zone)}
          inputMode="numeric"
          maxLength={6}
          hint={city.ubigeo ? `6 dígitos del INEI; empieza con ${city.ubigeo}.` : "6 dígitos del INEI."}
          className="[&_input]:font-mono"
          error={errors.ubigeo}
        />
        <TextField
          label="Orden"
          name="sort_order"
          type="number"
          inputMode="numeric"
          min={0}
          defaultValue={zone?.sort_order ?? 0}
          error={errors.sort_order}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${fileHintId}-file`} className="text-sm font-medium text-ink">
          {zone?.has_boundary ? "Reemplazar límite (opcional)" : "Límite (GeoJSON, opcional)"}
        </label>
        <input
          id={`${fileHintId}-file`}
          name="boundary"
          type="file"
          accept=".geojson,.json,application/geo+json,application/json"
          aria-invalid={errors.boundary ? true : undefined}
          aria-describedby={[errors.boundary && `${fileHintId}-error`, fileHintId].filter(Boolean).join(" ")}
          className="text-sm text-ink-2 file:mr-3 file:h-9 file:cursor-pointer file:rounded-[var(--radius-control)] file:border file:border-line file:bg-bg-soft file:px-3 file:font-medium file:text-ink"
        />
        <p id={fileHintId} className="text-xs text-ink-3">
          El límite oficial del distrito: en overpass-turbo.eu busca la relación de OpenStreetMap (admin_level 8) y
          expórtala como GeoJSON. Sin límite, el distrito se elige de la lista pero no se detecta por ubicación.
        </p>
        {errors.boundary && (
          <p id={`${fileHintId}-error`} className="text-sm text-destructive">
            {errors.boundary}
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending} className="h-10 rounded-[var(--radius-control)]">
          {pending ? "Guardando…" : zone ? "Guardar cambios" : "Agregar distrito"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="h-10 rounded-[var(--radius-control)]">
          Cancelar
        </Button>
      </div>
    </form>
  );
}
