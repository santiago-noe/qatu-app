import { expect, test } from "bun:test";
import { isActiveSection, locateSection } from "./admin-nav";

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
