"use client";

import { useEffect, useRef, useState } from "react";
import { FormAlert } from "@/components/form/form-alert";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import type { ApiAdminCity } from "@/lib/api";
import { cn } from "@/lib/utils";
import { slugify } from "@/features/protected/admin/lib/categories";
import {
  CITY_FIELDS,
  formatLatLng,
  parseLatLng,
  PLACE_NAME_MAX,
  placeFieldForError,
  validateCity,
  type CityField,
} from "@/features/protected/admin/lib/places";
import { useAdminAction } from "@/features/protected/admin/lib/use-admin-action";

interface CityFormProps {
  /** Al editar, la ciudad (el identificador y el ubigeo no cambian); al crear, undefined. */
  city?: ApiAdminCity;
  onDone(city: ApiAdminCity): void;
  onCancel?(): void;
  className?: string;
}

// Alta o edición de una ciudad. Nace apagada: se enciende cuando ya tiene distritos.
export function CityForm({ city, onDone, onCancel, className }: CityFormProps) {
  const { run, pending, alert, setAlert } = useAdminAction();
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Partial<Record<CityField, string>>>({});
  const [name, setName] = useState(city?.name ?? "");
  const [slug, setSlug] = useState(city?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(city));

  useEffect(() => {
    formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
  }, [errors]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const text = (key: string) => String(form.get(key) ?? "");
    const draft = { slug, name, region: text("region"), ubigeo: city?.ubigeo ?? text("ubigeo"), center: text("center") };
    const clientErrors = validateCity(draft);
    setErrors(clientErrors);
    setAlert(undefined);
    if (Object.keys(clientErrors).length > 0) return;

    const fields = { name: draft.name.trim(), region: draft.region.trim(), center: parseLatLng(draft.center) };
    const result = city
      ? await run<ApiAdminCity>(`/cities/${city.slug}`, { method: "PATCH", body: fields })
      : await run<ApiAdminCity>("/cities", {
          method: "POST",
          body: { ...fields, slug: draft.slug.trim(), ubigeo: draft.ubigeo.trim() },
        });
    if (result.ok) return onDone(result.data);

    const field = placeFieldForError(result.error.error, CITY_FIELDS);
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
          autoFocus={!city}
          error={errors.name}
        />
        <TextField
          label="Región"
          name="region"
          defaultValue={city?.region}
          maxLength={PLACE_NAME_MAX}
          error={errors.region}
        />
        <TextField
          label="Identificador"
          name="slug"
          value={slug}
          readOnly={Boolean(city)}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugTouched(true);
          }}
          hint={city ? "No cambia: va en las direcciones web." : "Va en las direcciones web; no se cambia después."}
          className="[&_input]:font-mono"
          error={errors.slug}
        />
        <TextField
          label="Ubigeo de la provincia (opcional)"
          name="ubigeo"
          defaultValue={city?.ubigeo}
          readOnly={Boolean(city)}
          inputMode="numeric"
          maxLength={4}
          hint="4 dígitos del INEI, por ejemplo 0501 para Huamanga."
          className="[&_input]:font-mono"
          error={errors.ubigeo}
        />
      </div>
      <TextField
        label="Centro del mapa (latitud, longitud)"
        name="center"
        defaultValue={city ? formatLatLng(city.center) : ""}
        placeholder="-13.1631, -74.2236"
        hint="La plaza principal. En Google Maps, clic derecho sobre el punto y copia las coordenadas."
        className="[&_input]:font-mono"
        error={errors.center}
      />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending} className="h-10 rounded-[var(--radius-control)]">
          {pending ? "Guardando…" : city ? "Guardar cambios" : "Crear ciudad"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="h-10 rounded-[var(--radius-control)]">
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
