import { expect, test } from "bun:test";
import { roleLabel, rolesDiff } from "./users";

test("rolesDiff solo toca los roles internos que cambian", () => {
  expect(rolesDiff(["client", "support"], ["support", "admin"])).toEqual({ add: ["admin"], remove: [] });
  expect(rolesDiff(["client", "admin", "moderator"], ["admin"])).toEqual({ add: [], remove: ["moderator"] });
  // Los roles de oferta nunca se quitan desde aquí.
  expect(rolesDiff(["client", "lender"], []).remove).toEqual([]);
});

test("roleLabel traduce y deja tal cual lo desconocido", () => {
  expect(roleLabel("moderator")).toBe("Moderación");
  expect(roleLabel("nuevo")).toBe("nuevo");
  expect(roleLabel("__proto__")).toBe("__proto__");
});
