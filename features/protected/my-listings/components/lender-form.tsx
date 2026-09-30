"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Building2, MapPin, Phone } from "lucide-react";
import { CheckboxField } from "@/components/form/checkbox-field";
import { FormAlert } from "@/components/form/form-alert";
import { SelectField } from "@/components/form/select-field";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import type { ApiLender } from "@/lib/api";
import { callBff } from "@/lib/bff-client";
import type { CityZones } from "@/lib/catalog";
import { ROUTES } from "@/lib/session";
import { cn } from "@/lib/utils";
import { lenderFieldForError, validateLender, type LenderField } from "@/features/protected/my-listings/lib/lender";
import { TextLink } from "@/features/auth/shared/components/text-link";

interface LenderFormProps {
  lender: ApiLender | null;
  cities: CityZones[];
  /** Distrito ya elegido en "Tu distrito", para no pedirlo de nuevo. */
  defaultZone?: { city: string; zone: string };
  /** Adónde ir al guardar. */
  next: string;
}

const KINDS = [
  { value: "person", label: "Como persona", hint: "Alquilas tus propias herramientas." },
  { value: "business", label: "Como negocio", hint: "Ferretería, taller o alquiladora." },
] as const;

// Activar (o editar) el perfil de arrendador: celular privado, distrito y condiciones (spec 003).
export function LenderForm({ lender, cities, defaultZone, next }: LenderFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const first = lender === null;
  const [kind, setKind] = useState<string>(lender?.kind ?? "person");
  const [citySlug, setCitySlug] = useState(lender?.city.slug ?? defaultZone?.city ?? cities[0]?.city.slug ?? "");
  const [zoneSlug, setZoneSlug] = useState(lender?.zone.slug ?? defaultZone?.zone ?? "");
  const [errors, setErrors] = useState<Partial<Record<LenderField, string>>>({});
  const [alert, setAlert] = useState<string>();
  const [pending, setPending] = useState(false);
  const zones = cities.find((c) => c.city.slug === citySlug)?.zones ?? [];

  useEffect(() => {
    formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
  }, [errors]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const draft = {
      kind,
      businessName: String(form.get("business_name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      zone: zoneSlug,
      acceptTerms: form.get("accept_terms") === "on",
      first,
    };
    const clientErrors = validateLender(draft);
    setErrors(clientErrors);
    setAlert(undefined);
    if (Object.keys(clientErrors).length > 0) return;

    setPending(true);
    const result = await callBff<{ lender: ApiLender }>("/api/me/lender", {
      method: "PUT",
      body: {
        kind,
        business_name: kind === "business" ? draft.businessName.trim() : "",
        phone: draft.phone,
        city: citySlug,
        zone: zoneSlug,
        accept_terms: draft.acceptTerms,
      },
    });
    if (result.ok) {
      router.push(next);
      router.refresh();
      return;
    }
    setPending(false);
    const field = lenderFieldForError(result.error.error);
    if (field) setErrors({ [field]: result.error.message });
    else setAlert(result.error.message);
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className="flex max-w-2xl flex-col gap-5 rounded-[var(--radius-card)] border border-line bg-bg p-5 sm:p-6"
    >
      <FormAlert>{alert}</FormAlert>

      <fieldset className="flex flex-col gap-2.5">
        <legend className="mb-2 text-sm font-medium text-ink">¿Cómo publicas?</legend>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {KINDS.map((k) => (
            <label
              key={k.value}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-[var(--radius-control)] border p-3.5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ink",
                kind === k.value ? "border-ink bg-bg-soft" : "border-line hover:border-ink-3/50",
              )}
            >
              <input
                type="radio"
                name="kind"
                value={k.value}
                checked={kind === k.value}
                onChange={() => setKind(k.value)}
                className="mt-1 size-4 accent-ink"
              />
              <span>
                <span className="block font-medium">{k.label}</span>
                <span className="block text-sm text-ink-2">{k.hint}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.kind && <p className="text-sm text-destructive">{errors.kind}</p>}
      </fieldset>

      {kind === "business" && (
        <TextField
          label="Nombre del negocio"
          name="business_name"
          icon={Building2}
          defaultValue={lender?.business_name}
          maxLength={80}
          error={errors.business_name}
        />
      )}

      <TextField
        label="Celular"
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        icon={Phone}
        defaultValue={lender?.phone.replace(/^\+51/, "")}
        placeholder="987 654 321"
        hint="Es privado: solo lo verá quien confirme una reserva contigo."
        error={errors.phone}
      />

      <div className="grid gap-4 sm:grid-cols-2">
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
          error={errors.zone}
        />
      </div>

      {first && (
        <CheckboxField name="accept_terms" error={errors.accept_terms}>
          Acepto las <TextLink href={ROUTES.terms}>condiciones de Qatu para arrendadores</TextLink>.
        </CheckboxField>
      )}

      <div>
        <Button type="submit" disabled={pending} className="h-11 rounded-[var(--radius-control)] px-6">
          {pending ? "Guardando…" : first ? "Activar mi perfil de arrendador" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
