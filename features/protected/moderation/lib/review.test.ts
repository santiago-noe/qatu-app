import { expect, test } from "bun:test";
import type { ApiListing, ApiReviewItem } from "@/lib/api";
import { rejectionError, reviewAttributes, reviewFacts } from "./review";

const listing = {
  id: "l1",
  title: "Rotomartillo Bosch",
  attributes: { brand: "Bosch", power_w: 800, power_source: "electric", extra: "" },
  prices: { hour: 0, day: 3500, weekend: 0, week: 18000, month: 0 },
  replacement_value: 45000,
  deposit: 14000,
  pickup_enabled: true,
  delivery_enabled: true,
  delivery_fee: 0,
  delivery_zone_ids: ["z1"],
  booking_mode: "request",
  cancel_policy: "moderate",
  min_verification: 2,
  min_notice_hours: 12,
  min_duration_hours: 24,
  max_duration_hours: 720,
} as unknown as ApiListing;

const item: ApiReviewItem = {
  listing,
  owner: { name: "Ana", first_listing: true },
  category: {
    id: "t1",
    name: "Rotomartillo",
    risk_level: "medium",
    attributes_schema: {
      type: "object",
      properties: {
        brand: { type: "string", title: "Marca" },
        power_w: { type: "integer", title: "Potencia (W)" },
        power_source: { type: "string", title: "Energía", enum: ["electric", "fuel"] },
        extra: { type: "string", title: "Extra" },
      },
    },
  },
  photos: [],
};

test("los datos de la publicación en texto", () => {
  const facts = Object.fromEntries(reviewFacts(item, (id) => (id === "z1" ? "Carmen Alto" : undefined)).map((f) => [f.label, f.value.replace(/\s/g, " ")]));
  expect(facts.Precios).toBe("Por día: S/ 35.00 · Por semana: S/ 180.00");
  expect(facts.Garantía).toBe("S/ 140.00");
  expect(facts.Entrega).toBe("Recojo · Delivery (gratis) a Carmen Alto");
  expect(facts.Cancelación).toBe("Moderada");
  expect(facts["Verificación mínima"]).toBe("Nivel 2");
  expect(facts.Duración).toBe("De 1 día a 30 días");
});

test("atributos con su etiqueta, sin vacíos", () => {
  expect(reviewAttributes(item)).toEqual([
    { label: "Marca", value: "Bosch" },
    { label: "Potencia (W)", value: "800" },
    { label: "Energía", value: "Eléctrica" },
  ]);
});

test("el rechazo pide motivo", () => {
  expect(rejectionError("  ")).toContain("Escribe el motivo");
  expect(rejectionError("a".repeat(501))).toContain("500");
  expect(rejectionError("Las fotos no muestran la herramienta.")).toBeUndefined();
});
