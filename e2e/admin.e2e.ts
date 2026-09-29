import AxeBuilder from "@axe-core/playwright";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import {
  AFTER_SIGNUP,
  apiAvailable,
  CODE_MAIL,
  grantRole,
  mailedCode,
  signin,
  signup,
  VERIFY_EMAIL_URL,
} from "./helpers";

// Panel admin contra qatu-api real. Cambia datos compartidos (catálogo, comisiones), así que corre
// en serie y solo en escritorio; lo que crea queda apagado para no aparecer en la landing.
test.describe.configure({ mode: "serial" });

let context: BrowserContext;
let page: Page;

test.beforeAll(async ({ browser }, info) => {
  test.skip(info.project.name !== "escritorio", "el panel se prueba una vez (escritorio)");
  test.skip(!(await apiAvailable()), "qatu-api no está corriendo");
  test.setTimeout(120_000); // go run compila la herramienta la primera vez

  // Contexto propio (no browser.newPage): axe lo necesita para analizar la página.
  context = await browser.newContext({ baseURL: info.project.use.baseURL });
  page = await context.newPage();
  const email = await signup(page);
  await expect(page).toHaveURL(VERIFY_EMAIL_URL, AFTER_SIGNUP);
  await grantRole(email, "admin");
  await signin(page, email);
  await page.getByLabel("Código de verificación").fill(await mailedCode(email, CODE_MAIL.twoFactor));
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByRole("heading", { name: "Hola, Ana" })).toBeVisible();
});

test.afterAll(async () => {
  await context?.close();
});

const noViolations = async () => expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

test("se entra desde el panel y cada sección es accesible", async () => {
  await page.getByRole("link", { name: "Administración" }).click();
  await expect(page).toHaveURL(/\/admin\/categorias$/);
  await expect(page.getByRole("heading", { level: 1, name: "Categorías de herramientas" })).toBeVisible();
  await noViolations();

  for (const [tab, heading] of [
    ["Oficios", "Oficios"],
    ["Comisiones", "Comisiones y tarifas"],
    ["Ciudades", "Ciudades"],
    ["Usuarios", "Usuarios"],
  ]) {
    await page.getByRole("link", { name: tab, exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await expect(page.getByRole("link", { name: tab, exact: true })).toHaveAttribute("aria-current", "page");
    await noViolations();
  }
});

test("crear, editar y validar una categoría", async () => {
  await page.goto("/admin/categorias");
  const name = `E2E Taladros ${Date.now()}`;

  await page.getByRole("button", { name: "Nueva categoría" }).click();
  await page.getByLabel("Nombre").fill(name);
  // El identificador se sugiere del nombre.
  await expect(page.getByLabel("Identificador")).toHaveValue(/^e2e-taladros-\d+$/);
  const slug = await page.getByLabel("Identificador").inputValue();
  await page.getByLabel("Activa: se muestra en el catálogo").uncheck();
  await page.getByLabel("Orden").fill("32000"); // al final de la lista del admin
  await page.getByRole("button", { name: "Crear" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Creada." })).toBeVisible();
  await expect(page.getByText(name, { exact: true })).toBeVisible();

  // Un identificador repetido se marca en su campo.
  await page.getByRole("button", { name: "Nueva categoría" }).click();
  await page.getByLabel("Nombre").fill(`${name} bis`);
  await page.getByLabel("Identificador").fill(slug);
  await page.getByRole("button", { name: "Crear" }).click();
  await expect(page.getByText("ya existe una categoría con ese identificador")).toBeVisible();
  await expect(page.getByLabel("Identificador")).toBeFocused();
  await page.getByRole("button", { name: "Cancelar" }).click();

  // Editar: un JSON inválido no llega al API; uno válido guarda el cambio.
  await page.getByRole("button", { name: `Editar ${name}` }).click();
  await page.getByLabel("Atributos (JSON Schema)").fill("no es json");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByText("No es un JSON válido de tipo objeto.")).toBeVisible();
  await page.getByLabel("Atributos (JSON Schema)").fill('{"type":"object","properties":{"potencia_w":{"type":"integer"}}}');
  await page.getByLabel("Nombre").fill(`${name} editada`);
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByText(`${name} editada`, { exact: true })).toBeVisible();
});

test("cambiar una comisión y verla en el historial", async () => {
  await page.goto("/admin/comisiones");
  const card = page.getByRole("region", { name: "Comisión al arrendador" });
  const general = card.getByRole("listitem").filter({ hasText: "General" });
  const original = (await general.getByText(/^\d+(\.\d+)? %$/).textContent())!.replace(" %", "");

  await general.getByRole("button", { name: /^Cambiar/ }).click();
  await general.getByLabel("Porcentaje").fill("200");
  await general.getByRole("button", { name: "Guardar" }).click();
  await expect(general.getByText(/porcentaje de 0 a 100/)).toBeVisible();

  const changed = original === "12.5" ? "12" : "12.5";
  await general.getByLabel("Porcentaje").fill(changed);
  await general.getByRole("button", { name: "Guardar" }).click();
  await expect(card.getByRole("status").filter({ hasText: "Solo afecta a las transacciones" })).toBeVisible();
  await expect(general.getByText(`${changed} %`, { exact: true })).toBeVisible();

  await card.getByRole("button", { name: "Ver historial" }).click();
  await expect(card.getByText(`${original} % → ${changed} %`).first()).toBeVisible();
  await expect(card.getByText(/Tú/).first()).toBeVisible();

  // Se deja como estaba.
  await general.getByRole("button", { name: /^Cambiar/ }).click();
  await general.getByLabel("Porcentaje").fill(original);
  await general.getByRole("button", { name: "Guardar" }).click();
  await expect(general.getByText(`${original} %`, { exact: true })).toBeVisible();
});

test("las ciudades se listan con su estado", async () => {
  await page.goto("/admin/ciudades");
  // No se apaga Ayacucho aquí: las demás pruebas usan su catálogo en paralelo.
  const ayacucho = page.getByRole("listitem").filter({ hasText: "Ayacucho" });
  await expect(ayacucho.getByText("Activa")).toBeVisible();
  await expect(ayacucho.getByRole("button", { name: "Apagar Ayacucho" })).toBeVisible();
});

test("buscar una cuenta, darle un rol interno y suspenderla", async ({ browser }, info) => {
  const other = await browser.newPage({ baseURL: info.project.use.baseURL });
  const email = await signup(other);
  await expect(other).toHaveURL(VERIFY_EMAIL_URL, AFTER_SIGNUP);
  await other.close();

  await page.goto("/admin/usuarios");
  await page.getByLabel("Correo de la cuenta").fill("nadie-existe@qatu.pe");
  await page.getByRole("button", { name: "Buscar" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "No hay ninguna cuenta con ese correo." })).toBeVisible();

  await page.getByLabel("Correo de la cuenta").fill(email.toUpperCase());
  await page.getByRole("button", { name: "Buscar" }).click();
  const account = page.getByRole("region", { name: "Ana Quispe" });
  await expect(account.getByText(email)).toBeVisible();

  await account.getByLabel("Soporte").check();
  await account.getByRole("button", { name: "Guardar roles" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Roles guardados" })).toBeVisible();
  await expect(account.getByText(/Roles: .*Soporte/)).toBeVisible();

  await account.getByRole("button", { name: "Suspender cuenta" }).click();
  await expect(account.getByText("Escribe el motivo")).toBeVisible();
  await account.getByLabel("Motivo de la suspensión").fill("Prueba e2e");
  await account.getByRole("button", { name: "Suspender cuenta" }).click();
  await expect(account.getByText("Suspendida", { exact: true })).toBeVisible();
  await expect(account.getByText("Motivo: Prueba e2e")).toBeVisible();

  await account.getByRole("button", { name: "Reactivar cuenta" }).click();
  await expect(account.getByText("Activa", { exact: true })).toBeVisible();
});

test("una cuenta sin rol admin no entra al panel", async ({ browser }, info) => {
  const client = await browser.newPage({ baseURL: info.project.use.baseURL });
  await signup(client);
  await expect(client).toHaveURL(VERIFY_EMAIL_URL, AFTER_SIGNUP);
  await client.goto("/admin/comisiones");
  await expect(client).toHaveURL(/\/unauthorized$/);
  await client.close();
});
