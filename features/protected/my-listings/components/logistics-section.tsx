"use client";

import { useState } from "react";
import { CheckboxField } from "@/components/form/checkbox-field";
import { TextField } from "@/components/form/text-field";
import type { ApiListing, ApiZone } from "@/lib/api";
import { centsToInput, solesToCents } from "@/lib/money";
import { useListingSave } from "@/features/protected/my-listings/lib/use-listing-save";
import { EditorSection } from "./editor-section";
import { PickupMap } from "./pickup-map";

type Field = "fulfillment" | "pickup" | "delivery_fee" | "delivery_zones";

const FIELD_BY_CODE: Record<string, Field> = {
  entrega_requerida: "fulfillment",
  punto_recojo_invalido: "pickup",
  distritos_delivery_invalidos: "delivery_zones",
};

interface LogisticsSectionProps {
  listing: ApiListing;
  editable: boolean;
  /** Centro de la ciudad del arrendador y sus distritos. */
  cityCenter: { lat: number; lng: number };
  zones: ApiZone[];
}

// Cómo llega la herramienta: recojo en un punto (exacto y privado; el público ve un círculo) y/o
// delivery con tarifa fija a los distritos elegidos (docs/02, A1 paso 7).
export function LogisticsSection({ listing, editable, cityCenter, zones }: LogisticsSectionProps) {
  const { save, pending, alert, notice, errors, reset } = useListingSave(listing, FIELD_BY_CODE);
  const [pickup, setPickup] = useState(listing.pickup_enabled);
  const [point, setPoint] = useState(listing.pickup_location);
  const [delivery, setDelivery] = useState(listing.delivery_enabled);
  const zoneName = zones.find((z) => z.id === listing.zone_id)?.name;
  // El círculo guardado solo se muestra si el punto no cambió desde entonces.
  const savedPoint = listing.pickup_location;
  const pointChanged = point?.lat !== savedPoint?.lat || point?.lng !== savedPoint?.lng;
  const publicArea =
    listing.public_location && listing.public_radius_m && !pointChanged
      ? { center: listing.public_location, radiusM: listing.public_radius_m }
      : null;

  async function onSubmit(form: FormData) {
    const clientErrors: Partial<Record<Field, string>> = {};
    const zoneIds = form.getAll("delivery_zone_ids").map(String);
    const feeText = String(form.get("delivery_fee") ?? "");
    const fee = feeText.trim() === "" ? 0 : solesToCents(feeText);
    if (!pickup && !delivery) clientErrors.fulfillment = "Ofrece recojo, delivery o ambos.";
    if (pickup && !point) clientErrors.pickup = "Marca en el mapa el punto de recojo.";
    if (delivery && fee === undefined) clientErrors.delivery_fee = "Escribe un monto válido, por ejemplo 10 o 10.50.";
    if (delivery && zoneIds.length === 0) clientErrors.delivery_zones = "Elige al menos un distrito.";
    reset(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;
    await save({
      pickup_enabled: pickup,
      pickup_location: pickup ? point : null,
      delivery_enabled: delivery,
      delivery_fee: delivery ? (fee ?? 0) : 0,
      delivery_zone_ids: delivery ? zoneIds : [],
    });
  }

  return (
    <EditorSection
      id="entrega"
      title="Entrega"
      description="Recojo en un punto, delivery o ambos. La dirección exacta solo la ve quien confirme una reserva."
      editable={editable}
      pending={pending}
      alert={alert ?? errors.fulfillment}
      notice={notice}
      errors={errors}
      onSubmit={onSubmit}
    >
      <CheckboxField name="pickup_enabled" checked={pickup} onChange={(e) => setPickup(e.target.checked)}>
        Ofrezco recojo en un punto
      </CheckboxField>
      {pickup && (
        <div className="flex flex-col gap-3">
          <PickupMap center={cityCenter} value={point} onChange={setPoint} publicArea={publicArea} disabled={!editable || pending} />
          {errors.pickup && <p className="text-sm text-destructive">{errors.pickup}</p>}
          <p className="rounded-[var(--radius-control)] bg-brand-soft px-3 py-2.5 text-sm text-ink">
            {publicArea
              ? `Así lo verá el público: un círculo de unos ${publicArea.radiusM} m${zoneName ? ` en ${zoneName}` : ""}, nunca el punto exacto.`
              : "Al guardar verás el círculo que mostrará Qatu en lugar del punto exacto."}
          </p>
        </div>
      )}

      <CheckboxField name="delivery_enabled" checked={delivery} onChange={(e) => setDelivery(e.target.checked)}>
        Ofrezco delivery
      </CheckboxField>
      {delivery && (
        <div className="flex flex-col gap-4">
          <TextField
            label="Tarifa de delivery"
            name="delivery_fee"
            inputMode="decimal"
            defaultValue={centsToInput(listing.delivery_fee)}
            hint="En soles. Vacío o 0 si el delivery es gratis."
            className="max-w-xs"
            error={errors.delivery_fee}
          />
          <fieldset aria-describedby={errors.delivery_zones ? "distritos-error" : undefined}>
            <legend className="mb-2 text-sm font-medium text-ink">Distritos a los que llevas</legend>
            <div className="grid gap-2 @md:grid-cols-2">
              {zones.map((z) => (
                <CheckboxField key={z.id} name="delivery_zone_ids" value={z.id} defaultChecked={listing.delivery_zone_ids.includes(z.id)}>
                  {z.name}
                </CheckboxField>
              ))}
            </div>
            {errors.delivery_zones && (
              <p id="distritos-error" className="mt-2 text-sm text-destructive">
                {errors.delivery_zones}
              </p>
            )}
          </fieldset>
        </div>
      )}
    </EditorSection>
  );
}
