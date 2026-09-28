import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { AFTER_SIGNUP, apiAvailable, signup } from "./helpers";

const PLAZA_DE_ARMAS = { latitude: -13.1631, longitude: -74.2237 };
const LIMA = { latitude: -12.0464, longitude: -77.0428 };

test.beforeEach(async ({ page }) => {
  test.skip(!(await apiAvailable()), "qatu-api no está corriendo");
  await signup(page);
  await expect(page).toHaveURL(/\/dashboard$/, AFTER_SIGNUP);
});

const card = (page: Page) => page.getByRole("region", { name: "Tu distrito" });

test("elegir el distrito de la lista y que se recuerde", async ({ page }) => {
  await card(page).getByLabel("Distrito").selectOption({ label: "Carmen Alto" });
  await card(page).getByRole("button", { name: "Guardar distrito" }).click();
  await expect(card(page).getByText("Carmen Alto, Ayacucho")).toBeVisible();

  await page.reload();
  await expect(card(page).getByText("Carmen Alto, Ayacucho")).toBeVisible();

  // Cambiarlo y cancelar deja el guardado.
  await card(page).getByRole("button", { name: "Cambiar" }).click();
  await card(page).getByRole("button", { name: "Cancelar" }).click();
  await expect(card(page).getByText("Carmen Alto, Ayacucho")).toBeVisible();
});

test("guardar sin elegir pide el distrito", async ({ page }) => {
  await card(page).getByRole("button", { name: "Guardar distrito" }).click();
  await expect(card(page).getByRole("alert").filter({ hasText: "Elige tu distrito." })).toBeVisible();
});

test("usar mi ubicación detecta el distrito", async ({ page, context }) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation(PLAZA_DE_ARMAS);
  await card(page).getByRole("button", { name: "Usar mi ubicación" }).click();
  await expect(card(page).getByRole("status")).toContainText("Estás en Ayacucho");
  await expect(card(page).getByLabel("Distrito")).toHaveValue("ayacucho");

  await card(page).getByRole("button", { name: "Guardar distrito" }).click();
  await expect(card(page).getByText("Ayacucho, Ayacucho")).toBeVisible();
});

test("fuera de cobertura avisa y deja elegir de la lista", async ({ page, context }) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation(LIMA);
  await card(page).getByRole("button", { name: "Usar mi ubicación" }).click();
  await expect(card(page).getByRole("alert")).toContainText("todavía no llegamos");
  await expect(card(page).getByLabel("Distrito")).toHaveValue("");
});

test("sin permiso de ubicación explica qué hacer", async ({ page, context }) => {
  await context.clearPermissions();
  await card(page).getByRole("button", { name: "Usar mi ubicación" }).click();
  await expect(card(page).getByRole("alert")).toContainText("distrito de la lista");
});

test("el panel no tiene problemas de accesibilidad detectables", async ({ page }) => {
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations).toEqual([]);
});
