"use client";

import { SelectField } from "@/components/form/select-field";
import type { ApiListing, RiskLevel } from "@/lib/api";
import { BOOKING_MODES, CANCEL_POLICIES, VERIFICATION_LEVELS } from "@/lib/listing-rules";
import { cn } from "@/lib/utils";
import {
  hourOptions,
  MAX_DURATION_OPTIONS,
  MIN_DURATION_OPTIONS,
  minVerificationFor,
  NOTICE_OPTIONS,
} from "@/features/protected/my-listings/lib/listings";
import { useListingSave } from "@/features/protected/my-listings/lib/use-listing-save";
import { EditorSection } from "./editor-section";

type Field = "booking_mode" | "cancel_policy" | "min_verification" | "durations";

const FIELD_BY_CODE: Record<string, Field> = {
  modo_reserva_invalido: "booking_mode",
  politica_invalida: "cancel_policy",
  verificacion_invalida: "min_verification",
  duraciones_invalidas: "durations",
};

interface Choice {
  value: string;
  label: string;
  hint: string;
}

// Opciones con explicación, como botones de radio grandes (cómodos en el celular).
function ChoiceGroup({ legend, name, choices, defaultValue }: { legend: string; name: string; choices: readonly Choice[]; defaultValue: string }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-medium text-ink">{legend}</legend>
      <div className="grid gap-2 @md:grid-cols-2 @3xl:grid-cols-3">
        {choices.map((c) => (
          <label
            key={c.value}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-[var(--radius-control)] border border-line p-3.5 transition-colors hover:border-ink-3/50",
              "has-[:checked]:border-ink has-[:checked]:bg-bg-soft has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ink",
            )}
          >
            <input type="radio" name={name} value={c.value} defaultChecked={c.value === defaultValue} className="mt-1 size-4 accent-ink" />
            <span>
              <span className="block font-medium">{c.label}</span>
              <span className="block text-sm text-ink-2">{c.hint}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

interface RulesSectionProps {
  listing: ApiListing;
  editable: boolean;
  risk: RiskLevel;
}

// Reglas: modo de reserva, cancelación (docs/02, A7), nivel mínimo del arrendatario (docs/05) y
// tiempos. El nivel nunca baja del que pide el riesgo de la categoría.
export function RulesSection({ listing, editable, risk }: RulesSectionProps) {
  const { save, pending, alert, notice, errors, reset } = useListingSave(listing, FIELD_BY_CODE);
  const minLevel = minVerificationFor(risk);
  const levels = VERIFICATION_LEVELS.filter((l) => l.value >= minLevel);

  async function onSubmit(form: FormData) {
    const num = (key: string) => Number(form.get(key));
    const minDuration = num("min_duration_hours");
    const maxDuration = num("max_duration_hours");
    const clientErrors: Partial<Record<Field, string>> = {};
    if (maxDuration < minDuration) clientErrors.durations = "La duración máxima no puede ser menor que la mínima.";
    reset(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;
    await save({
      booking_mode: String(form.get("booking_mode")) as ApiListing["booking_mode"],
      cancel_policy: String(form.get("cancel_policy")) as ApiListing["cancel_policy"],
      min_verification: num("min_verification"),
      min_notice_hours: num("min_notice_hours"),
      min_duration_hours: minDuration,
      max_duration_hours: maxDuration,
    });
  }

  return (
    <EditorSection
      id="reglas"
      title="Reglas"
      description="Cómo se reserva, qué pasa si cancelan y a quién le alquilas."
      editable={editable}
      pending={pending}
      alert={alert}
      notice={notice}
      errors={errors}
      onSubmit={onSubmit}
    >
      <ChoiceGroup legend="Modo de reserva" name="booking_mode" choices={BOOKING_MODES} defaultValue={listing.booking_mode} />
      <ChoiceGroup legend="Política de cancelación" name="cancel_policy" choices={CANCEL_POLICIES} defaultValue={listing.cancel_policy} />
      <ChoiceGroup
        legend="Verificación mínima de quien alquila"
        name="min_verification"
        choices={levels.map((l) => ({ ...l, value: String(l.value) }))}
        defaultValue={String(Math.max(listing.min_verification, minLevel))}
      />
      {minLevel === 2 && <p className="-mt-3 text-xs text-ink-3">Esta categoría es de riesgo alto: pide al menos el nivel 2.</p>}
      <div className="grid gap-4 @md:grid-cols-3">
        <SelectField
          label="Antelación mínima"
          name="min_notice_hours"
          defaultValue={String(listing.min_notice_hours)}
          options={hourOptions(NOTICE_OPTIONS, listing.min_notice_hours)}
        />
        <SelectField
          label="Alquiler mínimo"
          name="min_duration_hours"
          defaultValue={String(listing.min_duration_hours)}
          options={hourOptions(MIN_DURATION_OPTIONS, listing.min_duration_hours)}
          error={errors.durations}
        />
        <SelectField
          label="Alquiler máximo"
          name="max_duration_hours"
          defaultValue={String(listing.max_duration_hours)}
          options={hourOptions(MAX_DURATION_OPTIONS, listing.max_duration_hours)}
        />
      </div>
    </EditorSection>
  );
}
