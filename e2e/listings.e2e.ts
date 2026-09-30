import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { AFTER_SIGNUP, apiAvailable, CODE_MAIL, expectAccessible, mailedCode, signup, VERIFY_EMAIL_URL } from "./helpers";

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

const noViolations = () => expectAccessible(page);

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

  const tool = page.getByRole("form", { name: "La herramienta" });
  await tool.getByLabel("Marca (opcional)").fill("Bosch");
  await tool.getByLabel("Potencia (W) (opcional)").fill("800.5");
  await tool.getByRole("button", { name: "Guardar" }).click();
  await expect(tool.getByText("Escribe un número entero.")).toBeVisible();

  await tool.getByLabel("Potencia (W) (opcional)").fill("800");
  await tool.getByLabel("Energía (opcional)").selectOption({ label: "Eléctrica" });
  await tool.getByLabel("Accesorios incluidos (opcional)").fill("Maletín\nmaletín\nBroca de 10 mm");
  await tool.getByRole("button", { name: "Guardar" }).click();
  await expect(tool.getByRole("status")).toContainText("Guardamos los cambios.");

  // Lo guardado vuelve al recargar (accesorios sin repetidos).
  await page.reload();
  await expect(tool.getByLabel("Potencia (W) (opcional)")).toHaveValue("800");
  await expect(tool.getByLabel("Accesorios incluidos (opcional)")).toHaveValue("Maletín\nBroca de 10 mm");
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
  await expect(page.getByRole("form", { name: "La herramienta" }).getByLabel("Marca (opcional)")).toHaveValue("Bosch");

  await page.getByRole("link", { name: "Mis publicaciones" }).click();
  const copy = page.getByRole("article", { name: "Rotomartillo Bosch 800 W (copia)" });
  page.once("dialog", (d) => d.accept());
  await copy.getByRole("button", { name: "Archivar: Rotomartillo Bosch 800 W (copia)" }).click();
  await expect(copy.getByText("Archivada", { exact: true })).toBeVisible();
  await expect(copy.getByRole("link", { name: /^Ver / })).toBeVisible();
  await noViolations();
});

// Una foto PNG mínima pero válida (qatu-api la procesa como cualquier otra).
const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);
const photoFile = (name: string) => ({ name, mimeType: "image/png", buffer: TINY_PNG });

test("completar precios, entrega, reglas y fotos, y enviarla", async () => {
  test.setTimeout(90_000);
  await page.getByRole("link", { name: "Editar Rotomartillo Bosch 800 W" }).click();
  await expect(page.getByRole("navigation", { name: "Secciones de la publicación" })).toBeVisible();
  const send = page.getByRole("button", { name: "Enviar a publicar" });
  await expect(send).toBeDisabled();

  // Precios y garantía: la sugerida sale del valor de reposición (riesgo medio: 30 %).
  const prices = page.getByRole("form", { name: "Precios y garantía" });
  await prices.getByLabel("Por día").fill("35");
  await prices.getByLabel("Valor de reposición").fill("450");
  await expect(prices.getByText("Sugerida: S/ 140.00")).toBeVisible();
  await prices.getByLabel("Garantía").fill("900");
  await prices.getByRole("button", { name: "Guardar" }).click();
  await expect(prices.getByText(/Elige una garantía entre/)).toBeVisible();
  await prices.getByRole("button", { name: /Usar la sugerida/ }).click();
  await prices.getByRole("button", { name: "Guardar" }).click();
  await expect(prices.getByRole("status")).toContainText("Guardamos los cambios.");

  // Entrega: recojo en el centro del mapa (alternativa de teclado) y delivery a un distrito.
  const delivery = page.getByRole("form", { name: "Entrega" });
  await delivery.getByLabel("Ofrezco recojo en un punto").check();
  await expect(delivery.getByRole("region", { name: "Mapa para marcar el punto de recojo" })).toBeVisible();
  await delivery.getByRole("button", { name: "Guardar" }).click();
  await expect(delivery.getByText("Marca en el mapa el punto de recojo.")).toBeVisible();
  await delivery.getByRole("button", { name: "Marcar el centro del mapa" }).click();
  await expect(delivery.getByText(/Punto marcado: -13\./)).toBeVisible();
  await delivery.getByLabel("Ofrezco delivery").check();
  await delivery.getByLabel("Tarifa de delivery").fill("10");
  await delivery.getByLabel("Carmen Alto").check();
  await delivery.getByRole("button", { name: "Guardar" }).click();
  await expect(delivery.getByRole("status")).toContainText("Guardamos los cambios.");
  await expect(delivery.getByText(/Así lo verá el público: un círculo de unos 500 m/)).toBeVisible();

  // Reglas.
  const rules = page.getByRole("form", { name: "Reglas" });
  await rules.getByLabel(/Flexible/).check();
  await rules.getByLabel("Alquiler mínimo").selectOption({ label: "1 semana" });
  await rules.getByLabel("Alquiler máximo").selectOption({ label: "1 día" });
  await rules.getByRole("button", { name: "Guardar" }).click();
  await expect(rules.getByText("La duración máxima no puede ser menor que la mínima.")).toBeVisible();
  await rules.getByLabel("Alquiler máximo").selectOption({ label: "30 días" });
  await rules.getByRole("button", { name: "Guardar" }).click();
  await expect(rules.getByRole("status")).toContainText("Guardamos los cambios.");

  // Fotos: se suben directo al almacenamiento y se preparan en segundo plano.
  const photos = page.getByRole("region", { name: "Fotos" });
  await photos.getByLabel("Agregar fotos").setInputFiles([photoFile("1.png"), photoFile("2.png"), photoFile("3.png")]);
  await expect(photos.getByText("3 de 3 fotos mínimas listas")).toBeVisible({ timeout: 30_000 });
  await expect(photos.getByRole("img", { name: "Foto 1 de Rotomartillo Bosch 800 W" })).toBeVisible();
  await expect(photos.getByText("Portada", { exact: true })).toBeVisible();
  await photos.getByLabel("Agregar la foto de la placa").setInputFiles(photoFile("placa.png"));
  await expect(photos.getByRole("img", { name: "Placa de Rotomartillo Bosch 800 W" })).toBeVisible({ timeout: 30_000 });
  await noViolations();

  // Todo listo: primera publicación del arrendador, va a revisión.
  await expect(send).toBeEnabled();
  await send.click();
  await expect(page.getByText("En revisión", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Guardar" })).toHaveCount(0);
});
