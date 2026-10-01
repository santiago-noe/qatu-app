import { expect, test } from "bun:test";
import { attributeFields, readAttributes } from "@/lib/attributes";
import { formatHours } from "@/lib/listing-rules";
import { centsToInput, formatSoles, solesToCents } from "@/lib/money";
import { isPeruMobile, lenderFieldForError, validateLender } from "./lender";
import type { ApiListing } from "@/lib/api";
import {
  findToolType,
  hourOptions,
  minVerificationFor,
  publishChecklist,
  isEditable,
  listingActions,
  parseAccessories,
  toolTypeOptions,
} from "./listings";

test("montos en céntimos, sin coma flotante", () => {
  expect(solesToCents("35")).toBe(3500);
  expect(solesToCents("35,5")).toBe(3550);
  expect(solesToCents(" 0.07 ")).toBe(7);
  expect(solesToCents("100000")).toBe(10_000_000);
  for (const raw of ["", "-1", "1.234", "abc", "100000.01", "1e3"]) expect(solesToCents(raw), raw).toBeUndefined();
  expect(centsToInput(3550)).toBe("35.50");
  expect(centsToInput(0)).toBe("");
  expect(formatSoles(3550).replace(/\s/g, " ")).toBe("S/ 35.50"); // Intl usa un espacio no separable
});

test("acciones según el estado (la máquina de estados de qatu-api)", () => {
  expect(listingActions("draft")).toEqual(["submit", "duplicate", "archive"]);
  expect(listingActions("published")).toEqual(["pause", "duplicate", "archive"]);
  expect(listingActions("paused")).toContain("resume");
  expect(listingActions("in_review")).toEqual(["duplicate"]);
  expect(isEditable("in_review")).toBe(false);
  expect(isEditable("rejected")).toBe(true);
});

test("accesorios uno por línea, sin vacíos ni repetidos", () => {
  expect(parseAccessories(" Maletín \nmaletín\n\n Broca  de 10 mm")).toEqual(["Maletín", "Broca de 10 mm"]);
});

test("celular peruano", () => {
  for (const ok of ["987654321", "987 654 321", "+51 987-654-321", "(+51) 987.654.321", "0987654321"]) {
    expect(isPeruMobile(ok), ok).toBe(true);
  }
  for (const bad of ["", "066312345", "98765432", "98765432a", "+1 987654321"]) expect(isPeruMobile(bad), bad).toBe(false);
});

test("perfil de arrendador", () => {
  const ok = { kind: "person", businessName: "", phone: "987654321", zone: "carmen-alto", acceptTerms: true, first: true };
  expect(validateLender(ok)).toEqual({});
  expect(Object.keys(validateLender({ ...ok, kind: "business", acceptTerms: false, zone: "" })).sort()).toEqual([
    "accept_terms",
    "business_name",
    "zone",
  ]);
  expect(validateLender({ ...ok, acceptTerms: false, first: false })).toEqual({});
  expect(lenderFieldForError("celular_invalido")).toBe("phone");
  expect(lenderFieldForError("toString")).toBeUndefined();
});

const schema = {
  type: "object",
  properties: {
    brand: { type: "string", title: "Marca", maxLength: 10 },
    power_w: { type: "integer", title: "Potencia (W)", minimum: 1, maximum: 3000 },
    power_source: { type: "string", title: "Energía", enum: ["electric", "fuel", "solar"] },
    cordless: { type: "boolean" },
    weird: { type: "array" },
  },
  required: ["brand"],
};

test("el JSON Schema se convierte en campos", () => {
  const fields = attributeFields(schema);
  expect(fields.map((f) => f.name)).toEqual(["brand", "power_w", "power_source", "cordless"]);
  expect(fields[0]).toMatchObject({ label: "Marca", kind: "text", required: true, maxLength: 10 });
  expect(fields[2].options).toEqual([
    { value: "electric", label: "Eléctrica" },
    { value: "fuel", label: "A combustible" },
    { value: "solar", label: "solar" },
  ]);
  expect(fields[3].label).toBe("Cordless");
  expect(attributeFields(null)).toEqual([]);
  expect(attributeFields({ type: "object" })).toEqual([]);
});

test("los atributos se leen con su tipo", () => {
  const fields = attributeFields(schema);
  const form: Record<string, string | boolean> = { brand: " Bosch ", power_w: "800", power_source: "electric", cordless: true };
  expect(readAttributes(fields, (n) => form[n] ?? "", { requireAll: true })).toEqual({
    values: { brand: "Bosch", power_w: 800, power_source: "electric", cordless: true },
    errors: {},
  });

  const bad: Record<string, string> = { brand: "", power_w: "80.5" };
  const draft = readAttributes(fields, (n) => bad[n] ?? "", { requireAll: false });
  expect(draft.errors).toEqual({ power_w: "Escribe un número entero." });
  expect(readAttributes(fields, (n) => bad[n] ?? "", { requireAll: true }).errors.brand).toBe("Completa este dato.");
  expect(readAttributes(fields, (n) => (n === "power_w" ? "5000" : ""), { requireAll: false }).errors.power_w).toBe(
    "Entre 1 y 3000.",
  );
});

test("tipos de herramienta con su categoría", () => {
  const roots = [
    { id: "c1", slug: "construccion", name: "Construcción", risk_level: "medium" as const,
      children: [{ id: "t1", slug: "rotomartillo", name: "Rotomartillo", risk_level: "medium" as const }] },
    { id: "c2", slug: "vacia", name: "Vacía", risk_level: "low" as const },
  ];
  expect(toolTypeOptions(roots)).toEqual([{ value: "t1", label: "Construcción · Rotomartillo" }]);
  expect(findToolType(roots, "t1")?.root.name).toBe("Construcción");
  expect(findToolType(roots, "c1")).toBeUndefined();
});

test("reglas: horas legibles y opciones con el valor guardado", () => {
  expect([0, 1, 12, 24, 48, 168, 336, 720].map(formatHours)).toEqual([
    "Sin antelación",
    "1 hora",
    "12 horas",
    "1 día",
    "2 días",
    "1 semana",
    "2 semanas",
    "30 días",
  ]);
  expect(hourOptions([12, 24], 36).map((o) => o.value)).toEqual(["12", "24", "36"]);
  expect(minVerificationFor("high")).toBe(2);
  expect(minVerificationFor("medium")).toBe(1);
});

test("lista de lo que falta para publicar", () => {
  const base = {
    prices: { hour: 0, day: 0, weekend: 0, week: 0, month: 0 },
    replacement_value: 0,
    pickup_enabled: true,
    pickup_location: null,
    delivery_enabled: true,
    delivery_zone_ids: [] as string[],
  } as unknown as ApiListing;
  expect(publishChecklist(base, 2).every((i) => !i.done)).toBe(true);
  const ready = { ...base, prices: { ...base.prices, day: 3500 }, replacement_value: 45000, delivery_zone_ids: ["z1"] };
  expect(publishChecklist(ready, 3).every((i) => i.done)).toBe(true);
});
