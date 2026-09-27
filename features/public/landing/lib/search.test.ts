import { describe, expect, test } from "bun:test";
import { ALL_ZONES, buildSearchUrl, toIsoDate, toSlug, validateDates } from "./search";

const params = (url: string) => new URL(url, "http://localhost").searchParams;

describe("toSlug", () => {
  test.each([
    ["Construcción", "construccion"],
    ["Carpintería y taller", "carpinteria-y-taller"],
    ["Jesús Nazareno", "jesus-nazareno"],
    ["  Albañilería menor! ", "albanileria-menor"],
  ])("%p -> %p", (input, expected) => {
    expect(toSlug(input)).toBe(expected);
  });
});

describe("toIsoDate", () => {
  test("usa la fecha local, no UTC", () => {
    // 23:30 del 1 de octubre en hora local: en UTC-5 ya sería 2 de octubre.
    expect(toIsoDate(new Date(2026, 9, 1, 23, 30))).toBe("2026-10-01");
  });

  test("rellena mes y día con cero", () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  test("sin fecha devuelve cadena vacía", () => {
    expect(toIsoDate(undefined)).toBe("");
  });
});

describe("validateDates", () => {
  test("acepta rango válido o incompleto", () => {
    expect(validateDates("2026-10-01", "2026-10-03")).toBeNull();
    expect(validateDates("2026-10-01", "2026-10-01")).toBeNull();
    expect(validateDates("2026-10-01", "")).toBeNull();
    expect(validateDates("", "")).toBeNull();
  });

  test("rechaza fin anterior al inicio", () => {
    expect(validateDates("2026-10-03", "2026-10-01")).not.toBeNull();
  });
});

describe("buildSearchUrl", () => {
  test("por defecto busca en alquiler", () => {
    expect(buildSearchUrl({})).toBe("/buscar?tab=rent");
  });

  test("recorta el texto y omite campos vacíos", () => {
    const p = params(buildSearchUrl({ tab: "rent", q: "  taladro  ", zone: "", from: "", to: "" }));
    expect(p.get("q")).toBe("taladro");
    expect(p.has("zone")).toBe(false);
    expect(p.has("from")).toBe(false);
  });

  test("no envía la zona 'todo Huamanga'", () => {
    expect(params(buildSearchUrl({ zone: ALL_ZONES })).has("zone")).toBe(false);
    expect(params(buildSearchUrl({ zone: "carmen-alto" })).get("zone")).toBe("carmen-alto");
  });

  test("las fechas solo aplican al alquiler", () => {
    const rent = params(buildSearchUrl({ tab: "rent", from: "2026-10-01", to: "2026-10-03" }));
    expect(rent.get("from")).toBe("2026-10-01");
    expect(rent.get("to")).toBe("2026-10-03");

    const hire = params(buildSearchUrl({ tab: "hire", from: "2026-10-01", to: "2026-10-03" }));
    expect(hire.has("from")).toBe(false);
    expect(hire.has("to")).toBe(false);
  });

  test("incluye la categoría", () => {
    expect(params(buildSearchUrl({ tab: "hire", category: "gasfiteria" })).get("category")).toBe("gasfiteria");
  });
});
