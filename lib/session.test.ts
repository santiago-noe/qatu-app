import { describe, expect, test } from "bun:test";
import { ROUTES, safeNextPath } from "./session";

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
