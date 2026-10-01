"use client";

import { useEffect, useState } from "react";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import type { ApiDepositSuggestion, ApiListing, ApiPrices } from "@/lib/api";
import { callBff } from "@/lib/bff-client";
import { centsToInput, formatSoles, solesToCents } from "@/lib/money";
import { useListingSave } from "@/features/protected/my-listings/lib/use-listing-save";
import { EditorSection } from "./editor-section";

type PriceKey = keyof ApiPrices;
type Field = PriceKey | "replacement_value" | "deposit";

const FIELD_BY_CODE: Record<string, Field> = {
  precio_dia_requerido: "day",
  valor_reposicion_requerido: "replacement_value",
  garantia_fuera_de_rango: "deposit",
};

const PRICES: { key: PriceKey; label: string; hint?: string }[] = [
  { key: "day", label: "Por día", hint: "Obligatorio para publicar." },
  { key: "hour", label: "Por hora (opcional)" },
  { key: "weekend", label: "Fin de semana (opcional)" },
  { key: "week", label: "Por semana (opcional)" },
  { key: "month", label: "Por mes (opcional)" },
];

const MONEY_HINT = "En soles, por ejemplo 35 o 35.50.";

// Precios, valor de reposición (base para disputas) y la garantía, que Qatu sugiere según el valor y
// el riesgo de la categoría y se ajusta dentro de un rango (decisión de clarify de la 003).
export function PricesSection({ listing, editable }: { listing: ApiListing; editable: boolean }) {
  const { save, pending, alert, notice, errors, reset } = useListingSave(listing, FIELD_BY_CODE);
  const [replacement, setReplacement] = useState(centsToInput(listing.replacement_value));
  const [deposit, setDeposit] = useState(centsToInput(listing.deposit));
  const [suggestion, setSuggestion] = useState<ApiDepositSuggestion>();

  // La sugerencia se pide al escribir el valor (con una pausa corta para no pedirla por cada tecla).
  useEffect(() => {
    const cents = solesToCents(replacement);
    if (!cents) {
      setSuggestion(undefined);
      return;
    }
    const timer = setTimeout(async () => {
      const result = await callBff<ApiDepositSuggestion>(
        `/api/me/lender/deposit-suggestion?category=${listing.category_id}&value=${cents}`,
      );
      setSuggestion(result.ok ? result.data : undefined);
    }, 400);
    return () => clearTimeout(timer);
  }, [replacement, listing.category_id]);

  async function onSubmit(form: FormData) {
    const clientErrors: Partial<Record<Field, string>> = {};
    const money = (key: Field, raw: string) => {
      if (raw.trim() === "") return 0;
      const cents = solesToCents(raw);
      if (cents === undefined) clientErrors[key] = "Escribe un monto válido, por ejemplo 35 o 35.50.";
      return cents ?? 0;
    };
    const price = (key: PriceKey) => money(key, String(form.get(`price_${key}`) ?? ""));
    const prices: ApiPrices = { day: price("day"), hour: price("hour"), weekend: price("weekend"), week: price("week"), month: price("month") };
    const replacementValue = money("replacement_value", replacement);
    const depositValue = money("deposit", deposit);
    if (suggestion && replacementValue > 0 && (depositValue < suggestion.min || depositValue > suggestion.max))
      clientErrors.deposit = `Elige una garantía entre ${formatSoles(suggestion.min)} y ${formatSoles(suggestion.max)}.`;
    reset(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;
    await save({ prices, replacement_value: replacementValue, deposit: depositValue });
  }

  return (
    <EditorSection
      id="precios"
      title="Precios y garantía"
      description="Cuánto cobras y cuánto dejan de garantía. Cambiar los precios no afecta las reservas ya hechas."
      editable={editable}
      pending={pending}
      alert={alert}
      notice={notice}
      errors={errors}
      onSubmit={onSubmit}
    >
      <div className="grid gap-4 @md:grid-cols-2 @3xl:grid-cols-3">
        {PRICES.map((p) => (
          <TextField
            key={p.key}
            label={p.label}
            name={`price_${p.key}`}
            inputMode="decimal"
            defaultValue={centsToInput(listing.prices[p.key])}
            hint={p.hint ?? MONEY_HINT}
            error={errors[p.key]}
          />
        ))}
      </div>
      <div className="grid gap-4 @md:grid-cols-2">
        <TextField
          label="Valor de reposición"
          name="replacement_value"
          inputMode="decimal"
          value={replacement}
          onChange={(e) => setReplacement(e.target.value)}
          hint="Cuánto costaría comprarla de nuevo. Es la base si hay un daño o una pérdida."
          error={errors.replacement_value}
        />
        <div className="flex flex-col gap-2">
          <TextField
            label="Garantía"
            name="deposit"
            inputMode="decimal"
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
            hint={
              suggestion
                ? `Sugerida: ${formatSoles(suggestion.suggested)}. Puedes elegir entre ${formatSoles(suggestion.min)} y ${formatSoles(suggestion.max)}.`
                : "Escribe el valor de reposición para ver la garantía sugerida."
            }
            error={errors.deposit}
          />
          {suggestion && editable && centsToInput(suggestion.suggested) !== deposit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() => setDeposit(centsToInput(suggestion.suggested) || "0")}
            >
              Usar la sugerida ({formatSoles(suggestion.suggested)})
            </Button>
          )}
        </div>
      </div>
    </EditorSection>
  );
}
