import { expect, test } from "bun:test";
import type { ApiAdminCategory, ApiAdminCity, ApiSetting } from "@/lib/api";
import { greeting, summarize } from "./overview";

const cat = (id: string, extra: Partial<ApiAdminCategory> = {}): ApiAdminCategory => ({
  id,
  vertical: "rental",
  slug: id,
  name: id,
  sort_order: 0,
  attributes_schema: {},
  risk_level: "medium",
  prohibited: false,
  enabled: true,
  ...extra,
});

const city = (slug: string, enabled: boolean): ApiAdminCity => ({ id: slug, slug, name: slug, region: "R", enabled });

const setting = (key: string, value: number, updated_at: string, scope: Partial<ApiSetting> = {}): ApiSetting => ({
  id: key + (scope.city_id ?? ""),
  key,
  value,
  updated_at,
  version: 1,
  ...scope,
});

test("summarize cuenta solo lo que viene del API", () => {
  const rental = [
    cat("construccion", { children: [cat("andamios", { risk_level: "high" }), cat("amoladora")] }),
    cat("eventos", { enabled: false, children: [cat("toldos", { enabled: false })] }),
  ];
  const service = [cat("gasfiteria", { vertical: "service" }), cat("armas", { vertical: "service", prohibited: true })];
  const s = summarize(rental, service, [city("ayacucho", true), city("huanta", false)], [
    setting("rental.owner_commission_bps", 1000, "2026-09-01T00:00:00Z"),
    setting("rental.owner_commission_bps", 800, "2026-09-20T00:00:00Z", { city_id: "huanta" }),
  ]);

  expect(s.rental).toEqual({ roots: 2, rootsOff: 1, children: 3, highRisk: 1 });
  expect(s.service.roots).toBe(2);
  expect(s.cities).toEqual({ total: 2, on: 1 });
  // Comisiones vigentes: solo las generales; el último cambio considera todas.
  expect(s.commissions.map((c) => c.value)).toEqual([1000]);
  expect(s.lastChange).toBe("2026-09-20T00:00:00Z");
  expect(s.attention.items.map((a) => `${a.label}:${a.detail}`)).toEqual([
    "huanta:Ciudad apagada",
    "eventos:Apagada",
    "toldos:Apagada",
    "armas:Prohibida",
  ]);
});

test("attention se corta y dice cuántos faltan", () => {
  const rental = Array.from({ length: 8 }, (_, i) => cat(`c${i}`, { enabled: false }));
  const { attention } = summarize(rental, [], [], [], 6);
  expect(attention.items).toHaveLength(6);
  expect(attention.more).toBe(2);
});

test("greeting usa la hora de Lima (UTC-5)", () => {
  expect(greeting(new Date("2026-09-28T13:00:00Z"))).toBe("Buenos días"); // 8:00 en Lima
  expect(greeting(new Date("2026-09-28T20:00:00Z"))).toBe("Buenas tardes"); // 15:00
  expect(greeting(new Date("2026-09-29T02:00:00Z"))).toBe("Buenas noches"); // 21:00
});
