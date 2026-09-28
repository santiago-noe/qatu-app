import { describe, expect, test } from "bun:test";
import { ROUTES, safeNextPath, withNext } from "./session";

describe("safeNextPath", () => {
  test.each([
    ["/dashboard/rentals", "/dashboard/rentals"],
    ["/buscar?q=taladro", "/buscar?q=taladro"],
  ])("acepta la ruta interna %p", (input, expected) => {
    expect(safeNextPath(input)).toBe(expected);
  });

  test.each([null, undefined, "", "https://otro.com", "//otro.com", "/\\otro.com", "javascript:alert(1)"])(
    "rechaza %p y vuelve al panel",
    (input) => {
      expect(safeNextPath(input)).toBe(ROUTES.dashboard);
    },
  );
});

test("withNext codifica el destino para que no rompa la URL", () => {
  expect(withNext(ROUTES.twoFactor, "/dashboard?tab=a&b=c")).toBe("/auth/two-factor?next=%2Fdashboard%3Ftab%3Da%26b%3Dc");
});
