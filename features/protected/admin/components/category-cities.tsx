"use client";

import { useEffect, useState } from "react";
import type { ApiAdminCategory, ApiCategoryCity } from "@/lib/api";
import { callBff } from "@/lib/bff-client";
import { cn } from "@/lib/utils";
import { useAdminAction } from "@/features/protected/admin/lib/use-admin-action";
import { ActionStatus } from "./action-status";
import { Badge } from "./badge";

type Choice = "global" | "on" | "off";

const CHOICES: { value: Choice; label: string }[] = [
  { value: "global", label: "General" },
  { value: "on", label: "Activa" },
  { value: "off", label: "Apagada" },
];

const toChoice = (override: boolean | null): Choice => (override === null ? "global" : override ? "on" : "off");
const toOverride = (choice: Choice): boolean | null => (choice === "global" ? null : choice === "on");

// Alcance por ciudad de una categoría (feature flag, spec 002): sin ajuste sigue su valor general
// (Activa o Apagada arriba); con ajuste manda la ciudad. Una prohibida no se ofrece en ninguna.
export function CategoryCities({ category }: { category: ApiAdminCategory }) {
  const { run, pending, alert, notice } = useAdminAction();
  const [cities, setCities] = useState<ApiCategoryCity[]>();
  const [loadError, setLoadError] = useState<string>();
  const path = `/api/admin/catalog/categories/${category.id}/cities`;

  // Se relee al cambiar la categoría o su valor general (el efectivo de cada ciudad depende de él).
  useEffect(() => {
    let active = true;
    callBff<{ cities: ApiCategoryCity[] }>(path).then((result) => {
      if (!active) return;
      if (result.ok) setCities(result.data.cities);
      else setLoadError(result.error.message);
    });
    return () => {
      active = false;
    };
  }, [path, category.enabled, category.prohibited]);

  async function choose(city: ApiCategoryCity, choice: Choice) {
    const override = toOverride(choice);
    const result = await run(`/catalog/categories/${category.id}/cities/${city.city}`, {
      method: "PUT",
      body: { enabled: override },
      success: `${category.name} en ${city.name}: ${CHOICES.find((c) => c.value === choice)?.label.toLowerCase()}.`,
      refresh: false,
    });
    if (!result.ok) return;
    const reload = await callBff<{ cities: ApiCategoryCity[] }>(path);
    if (reload.ok) setCities(reload.data.cities);
  }

  return (
    <section aria-labelledby={`ciudades-${category.id}`} className="flex flex-col gap-3 border-t border-line pt-5">
      <div>
        <h3 id={`ciudades-${category.id}`} className="font-semibold">
          Por ciudad
        </h3>
        <p className="mt-1 text-sm text-ink-2">
          {category.prohibited
            ? "Prohibida: no se ofrece en ninguna ciudad."
            : `Con «General» sigue su valor de arriba (${category.enabled ? "activa" : "apagada"}); elige otra opción para esa ciudad sola.`}
        </p>
      </div>
      <ActionStatus alert={alert ?? loadError} notice={notice} />
      {!cities && !loadError && <p className="text-sm text-ink-3">Cargando ciudades…</p>}
      <ul className="flex flex-col divide-y divide-line">
        {cities?.map((city) => (
          <li key={city.city} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="font-medium">{city.name}</span>
              {!city.city_enabled && <Badge>Ciudad apagada</Badge>}
              <Badge tone={city.active ? "ok" : "neutral"}>{city.active ? "Se ofrece" : "No se ofrece"}</Badge>
            </div>
            <fieldset disabled={pending || category.prohibited} className="flex rounded-full border border-line p-0.5">
              <legend className="sr-only">
                {category.name} en {city.name}
              </legend>
              {CHOICES.map((choice) => {
                const checked = toChoice(city.override) === choice.value;
                return (
                  <label
                    key={choice.value}
                    className={cn(
                      "cursor-pointer rounded-full px-3 py-1 text-sm font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ink",
                      checked ? "bg-ink text-white" : "text-ink-2 hover:text-ink",
                    )}
                  >
                    <input
                      type="radio"
                      name={`scope-${category.id}-${city.city}`}
                      value={choice.value}
                      checked={checked}
                      onChange={() => choose(city, choice.value)}
                      className="sr-only"
                    />
                    {choice.label}
                  </label>
                );
              })}
            </fieldset>
          </li>
        ))}
      </ul>
    </section>
  );
}
