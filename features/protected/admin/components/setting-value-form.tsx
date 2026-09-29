"use client";

import { useState } from "react";
import { FormAlert } from "@/components/form/form-alert";
import { SelectField } from "@/components/form/select-field";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import type { ApiAdminCategory, ApiAdminCity } from "@/lib/api";
import { bpsToInput, percentToBps } from "@/features/protected/admin/lib/settings";
import { useAdminAction } from "@/features/protected/admin/lib/use-admin-action";

/** Alcance de un valor: ciudad (slug) y categoría; vacíos = todas. */
export interface Scope {
  city: string;
  categoryId: string;
}

interface SettingValueFormProps {
  settingKey: string;
  /** Alcance fijo (cambiar un valor existente). Sin él, se elige ciudad y categoría. */
  scope?: Scope;
  initialBps?: number;
  cities?: ApiAdminCity[];
  categories?: { category: ApiAdminCategory; depth: 0 | 1 }[];
  onDone(): void;
  onCancel(): void;
}

// Cambia (o crea) el valor de un ajuste en un alcance. El porcentaje se envía en puntos básicos.
export function SettingValueForm({ settingKey, scope, initialBps, cities = [], categories = [], onDone, onCancel }: SettingValueFormProps) {
  const { run, pending, alert } = useAdminAction();
  const [error, setError] = useState<string>();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const value = percentToBps(String(form.get("percent") ?? ""));
    if (value === undefined) {
      setError("Escribe un porcentaje de 0 a 100, con hasta 2 decimales (ej. 10 o 7.5).");
      return;
    }
    setError(undefined);
    const body = {
      key: settingKey,
      city: scope?.city ?? String(form.get("city") ?? ""),
      category_id: scope?.categoryId ?? String(form.get("category_id") ?? ""),
      value,
    };
    const result = await run("/settings", { method: "PUT", body });
    if (result.ok) onDone();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-3 flex flex-col gap-3 rounded-[var(--radius-control)] bg-bg-soft p-3">
      <FormAlert>{alert}</FormAlert>
      {!scope && (
        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField
            label="Ciudad"
            name="city"
            defaultValue=""
            options={[{ value: "", label: "Todas" }, ...cities.map((c) => ({ value: c.slug, label: c.name }))]}
          />
          <SelectField
            label="Categoría"
            name="category_id"
            defaultValue=""
            options={[
              { value: "", label: "Todas" },
              ...categories.map(({ category, depth }) => ({
                value: category.id,
                label: depth === 1 ? `— ${category.name}` : category.name,
              })),
            ]}
          />
        </div>
      )}
      <TextField
        label="Porcentaje"
        name="percent"
        inputMode="decimal"
        defaultValue={initialBps === undefined ? "" : bpsToInput(initialBps)}
        placeholder="Ej. 10"
        autoFocus
        error={error}
      />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending} className="h-10 rounded-[var(--radius-control)]">
          {pending ? "Guardando…" : "Guardar"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="h-10 rounded-[var(--radius-control)]">
          Cancelar
        </Button>
      </div>
    </form>
  );
}
