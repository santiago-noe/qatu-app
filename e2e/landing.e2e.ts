import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 0) < 768;

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("carga la landing con un solo H1 y el título de Qatu", async ({ page }) => {
  await expect(page).toHaveTitle(/Qatu/);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("cuando las necesitas");
});

test("el buscador envía a /buscar con lo elegido", async ({ page }) => {
  if (isMobile(page)) {
    await page.locator("#buscar").getByRole("button", { name: /¿Qué necesitas\?/ }).click();
    const sheet = page.getByRole("dialog", { name: "Buscar en Qatu" });
    await expect(sheet).toBeVisible();
    await sheet.getByRole("textbox", { name: "¿Qué necesitas?" }).fill("rotomartillo");
    await sheet.getByRole("button", { name: "Buscar" }).click();
  } else {
    const panel = page.locator("#buscar form");
    await panel.getByRole("textbox", { name: "¿Qué necesitas?" }).fill("rotomartillo");
    await panel.getByRole("button", { name: "Buscar" }).click();
  }
  await expect(page).toHaveURL(/\/buscar\?tab=rent&q=rotomartillo/);
  await expect(page.getByRole("heading", { name: "La búsqueda llega pronto" })).toBeVisible();
});

test("en 'Contratar servicios' no se piden fechas", async ({ page }) => {
  test.skip(isMobile(page), "en móvil las pestañas están dentro de la hoja");
  const section = page.locator("#buscar");
  await expect(section.getByText("Cuándo")).toBeVisible();
  await section.getByRole("tab", { name: "Contratar servicios" }).click();
  await expect(section.getByText("Cuándo")).toHaveCount(0);
});

test("el buscador de la cabecera envía la consulta", async ({ page }) => {
  test.skip(isMobile(page), "en móvil la cabecera muestra solo el ícono de búsqueda");
  const box = page.getByRole("searchbox", { name: "Buscar en Qatu" });
  await box.fill("gasfitero");
  await box.press("Enter");
  await expect(page).toHaveURL(/\/buscar\?q=gasfitero/);
});

test("el menú móvil se abre y se cierra con Escape", async ({ page }) => {
  test.skip(!isMobile(page), "solo en móvil");
  await page.getByRole("button", { name: "Abrir menú" }).click();
  const menu = page.getByRole("navigation", { name: "Principal móvil" });
  await expect(menu).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
});

test("la cabecera se oculta al bajar y reaparece al subir", async ({ page }) => {
  const header = page.locator("header");
  // Esperar la hidratación: antes de eso la cabecera aún no escucha el scroll.
  await page.waitForLoadState("networkidle");
  await page.mouse.move(640, 400);
  await page.mouse.wheel(0, 1200);
  await expect.poll(async () => (await header.boundingBox())?.y ?? 0).toBeLessThan(0);
  await page.mouse.wheel(0, -300);
  await expect.poll(async () => (await header.boundingBox())?.y ?? -1).toBe(0);
});

test("cada tarjeta de categoría lleva a la búsqueda filtrada", async ({ page }) => {
  await page.locator("#herramientas").getByRole("link", { name: /Construcción/ }).click();
  await expect(page).toHaveURL(/\/buscar\?tab=rent&category=construccion/);
});

test("los enlaces legales responden, incluido el Libro de Reclamaciones", async ({ page, request }) => {
  const footer = page.locator("footer");
  for (const name of ["Términos y condiciones", "Política de privacidad", "Libro de Reclamaciones"]) {
    const href = await footer.getByRole("link", { name }).getAttribute("href");
    expect(href).toBeTruthy();
    expect((await request.get(href!)).status()).toBe(200);
  }
});

test("sin violaciones de accesibilidad graves (axe, WCAG 2.1 AA)", async ({ page }) => {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
});
