import { expect, test } from "bun:test";
import { groupsFor, isActiveSection, locateSection, staffHome, staffRoles } from "./admin-nav";

test("el Resumen solo está activo en /admin", () => {
  expect(isActiveSection("/admin", "/admin")).toBe(true);
  expect(isActiveSection("/admin", "/admin/categorias")).toBe(false);
  expect(isActiveSection("/admin/categorias", "/admin/categorias/x")).toBe(true);
  expect(isActiveSection("/admin/oficios", "/admin/oficios-viejos")).toBe(false);
});

test("locateSection da el grupo para la barra superior", () => {
  expect(locateSection("/admin/comisiones")).toMatchObject({ group: "Plataforma", section: { label: "Comisiones" } });
  expect(locateSection("/admin").section?.label).toBe("Resumen");
  expect(locateSection("/otra")).toEqual({});
});

test("cada rol ve sus secciones", () => {
  const labels = (roles: Parameters<typeof groupsFor>[0]) => groupsFor(roles).flatMap((g) => g.sections.map((s) => s.label));
  expect(labels(["moderator"])).toEqual(["Moderación"]);
  expect(labels(["admin"])).toContain("Moderación");
  expect(labels(["admin"])).toContain("Usuarios");
  expect(labels([])).toEqual([]);
  expect(staffRoles(["client", "moderator", "lender"])).toEqual(["moderator"]);
  expect(staffHome(["moderator"])).toBe("/admin/moderacion");
  expect(staffHome(["moderator", "admin"])).toBe("/admin");
});
