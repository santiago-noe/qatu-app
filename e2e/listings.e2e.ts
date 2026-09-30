import AxeBuilder from "@axe-core/playwright";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { AFTER_SIGNUP, apiAvailable, CODE_MAIL, mailedCode, signup, VERIFY_EMAIL_URL } from "./helpers";

// Arrendador (feature 003): activar el perfil, crear un borrador, completar la herramienta y usar
// las acciones de "Mis publicaciones". Una sola cuenta recorre todo, en serie.
test.describe.configure({ mode: "serial" });

let context: BrowserContext;
let page: Page;

test.beforeAll(async ({ browser }, info) => {
  test.skip(!(await apiAvailable()), "qatu-api no está corriendo");
  context = await browser.newContext({ baseURL: info.project.use.baseURL, ...info.project.use });
  page = await context.newPage();
  const email = await signup(page);
  await expect(page).toHaveURL(VERIFY_EMAIL_URL, AFTER_SIGNUP);
  await page.getByLabel("Código de verificación").fill(await mailedCode(email, CODE_MAIL.verifyEmail));
  await page.getByRole("button", { name: "Confirmar mi correo" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

test.afterAll(async () => {
  await context?.close();
});

const noViolations = async () => expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

test("activar el perfil de arrendador desde el panel", async () => {
  await page.getByRole("link", { name: "Publicar mis herramientas" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Publica tus herramientas" })).toBeVisible();
  await noViolations();

  await page.getByLabel("Celular").fill("12345");
  await page.getByRole("button", { name: "Activar mi perfil de arrendador" }).click();
  await expect(page.getByText("Escribe un celular de 9 dígitos")).toBeVisible();
  await expect(page.getByText("Acepta las condiciones de arrendador")).toBeVisible();
  await expect(page.getByLabel("Celular")).toBeFocused();

  await page.getByLabel("Como negocio").check();
  await page.getByLabel("Nombre del negocio").fill("Ferretería El Maestro");
  await page.getByLabel("Celular").fill("987 654 321");
  await page.getByLabel("Distrito").selectOption({ label: "Carmen Alto" });
  await page.getByLabel(/Acepto las/).check();
  await page.getByRole("button", { name: "Activar mi perfil de arrendador" }).click();

  await expect(page.getByRole("heading", { level: 1, name: "Mis publicaciones" })).toBeVisible();
  await expect(page.getByText("Aún no tienes publicaciones")).toBeVisible();
  await noViolations();
});

test("crear un borrador y completar la herramienta", async () => {
  await page.getByRole("link", { name: "Publicar una herramienta" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByText("Elige el tipo de herramienta.")).toBeVisible();

  await page.getByLabel("Tipo de herramienta").selectOption({ label: "Construcción · Rotomartillo" });
  await page.getByLabel("Título").fill("Rotomartillo Bosch 800 W");
  await page.getByRole("button", { name: "Continuar" }).click();

  // El editor muestra los datos que pide la categoría raíz (Construcción) para sus tipos.
  await expect(page.getByRole("heading", { level: 1, name: "Rotomartillo Bosch 800 W" })).toBeVisible();
  await expect(page.getByText("Borrador", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Marca (opcional)")).toBeVisible();
  await noViolations();

  await page.getByLabel("Marca (opcional)").fill("Bosch");
  await page.getByLabel("Potencia (W) (opcional)").fill("800.5");
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByText("Escribe un número entero.")).toBeVisible();

  await page.getByLabel("Potencia (W) (opcional)").fill("800");
  await page.getByLabel("Energía (opcional)").selectOption({ label: "Eléctrica" });
  await page.getByLabel("Accesorios incluidos (opcional)").fill("Maletín\nmaletín\nBroca de 10 mm");
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Guardamos los cambios." })).toBeVisible();

  // Lo guardado vuelve al recargar (accesorios sin repetidos).
  await page.reload();
  await expect(page.getByLabel("Potencia (W) (opcional)")).toHaveValue("800");
  await expect(page.getByLabel("Accesorios incluidos (opcional)")).toHaveValue("Maletín\nBroca de 10 mm");
});

test("las acciones de Mis publicaciones", async () => {
  await page.getByRole("link", { name: "Mis publicaciones" }).click();
  const card = page.getByRole("article", { name: "Rotomartillo Bosch 800 W" });
  await expect(card.getByText("Borrador", { exact: true })).toBeVisible();

  // Sin precio ni fotos no se puede enviar: el motivo sale en la tarjeta.
  await card.getByRole("button", { name: "Enviar a publicar: Rotomartillo Bosch 800 W" }).click();
  await expect(card.getByRole("alert")).toBeVisible();

  await card.getByRole("button", { name: "Duplicar: Rotomartillo Bosch 800 W" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Rotomartillo Bosch 800 W (copia)" })).toBeVisible();
  await expect(page.getByLabel("Marca (opcional)")).toHaveValue("Bosch");

  await page.getByRole("link", { name: "Mis publicaciones" }).click();
  const copy = page.getByRole("article", { name: "Rotomartillo Bosch 800 W (copia)" });
  page.once("dialog", (d) => d.accept());
  await copy.getByRole("button", { name: "Archivar: Rotomartillo Bosch 800 W (copia)" }).click();
  await expect(copy.getByText("Archivada", { exact: true })).toBeVisible();
  await expect(copy.getByRole("link", { name: /^Ver / })).toBeVisible();
  await noViolations();
});
