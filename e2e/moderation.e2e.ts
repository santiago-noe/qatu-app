import { expect, test, type APIRequestContext, type BrowserContext, type Page } from "@playwright/test";
import {
  AFTER_SIGNUP,
  apiAvailable,
  CODE_MAIL,
  expectAccessible,
  grantRole,
  mailedCode,
  signin,
  signup,
  VERIFY_EMAIL_URL,
} from "./helpers";

// Moderación (feature 003): un arrendador envía dos publicaciones completas y un moderador, con su
// segundo paso, aprueba una y rechaza la otra con motivo. Solo en escritorio (una vez).
test.describe.configure({ mode: "serial" });

const API = `${process.env.API_BASE_URL ?? "http://localhost:8080"}/api/v1`;
const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

let lender: BrowserContext;
let lenderPage: Page;
let moderator: BrowserContext;
let modPage: Page;
const stamp = Date.now();
const approved = `Rotomartillo aprobado ${stamp}`;
const rejected = `Rotomartillo rechazado ${stamp}`;

async function verifiedAccount(page: Page): Promise<string> {
  const email = await signup(page);
  await expect(page).toHaveURL(VERIFY_EMAIL_URL, AFTER_SIGNUP);
  await page.getByLabel("Código de verificación").fill(await mailedCode(email, CODE_MAIL.verifyEmail));
  await page.getByRole("button", { name: "Confirmar mi correo" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  return email;
}

/** Una publicación completa con 3 fotos, enviada (primera del arrendador: queda en revisión). */
async function submittedListing(request: APIRequestContext, title: string, categoryId: string, zoneId: string) {
  const created = await request.post("/api/me/listings", {
    data: {
      category_id: categoryId,
      title,
      attributes: { brand: "Bosch" },
      replacement_value: 45000,
      deposit: 14000,
      prices: { day: 3500 },
      delivery_enabled: true,
      delivery_fee: 1000,
      delivery_zone_ids: [zoneId],
    },
  });
  expect(created.status()).toBe(201);
  const listing = await created.json();
  for (let i = 0; i < 3; i++) {
    const res = await request.post(`/api/me/listings/${listing.id}/photos`, {
      data: { kind: "public", content_type: "image/png", size: TINY_PNG.length },
    });
    const { photo, upload } = await res.json();
    expect((await request.put(upload.url, { headers: upload.headers, data: TINY_PNG })).ok()).toBe(true);
    await request.post(`/api/me/listings/${listing.id}/photos/${photo.id}/complete`, { data: {} });
  }
  await expect
    .poll(async () => {
      const { photos } = await (await request.get(`/api/me/listings/${listing.id}/photos`)).json();
      return photos.filter((p: { status: string }) => p.status === "ready").length;
    }, { timeout: 30_000 })
    .toBe(3);
  const submitted = await request.post(`/api/me/listings/${listing.id}/submit`, { data: { version: listing.version } });
  expect((await submitted.json()).status).toBe("in_review");
}

test.beforeAll(async ({ browser }, info) => {
  test.skip(info.project.name !== "escritorio", "la moderación se prueba una vez (escritorio)");
  test.skip(!(await apiAvailable()), "qatu-api no está corriendo");
  test.setTimeout(180_000);

  // Arrendador con dos publicaciones en revisión.
  lender = await browser.newContext({ baseURL: info.project.use.baseURL });
  lenderPage = await lender.newPage();
  await verifiedAccount(lenderPage);
  expect(
    (
      await lenderPage.request.put("/api/me/lender", {
        data: { kind: "person", phone: "987654321", city: "ayacucho", zone: "carmen-alto", accept_terms: true },
      })
    ).ok(),
  ).toBe(true);
  const { categories } = await (await fetch(`${API}/catalog/categories?vertical=rental&city=ayacucho`)).json();
  const roto = categories.flatMap((c: { children?: { id: string; slug: string }[] }) => c.children ?? []).find((c: { slug: string }) => c.slug === "rotomartillo");
  const { zones } = await (await fetch(`${API}/cities/ayacucho/zones`)).json();
  const zone = zones.find((z: { slug: string }) => z.slug === "carmen-alto");
  await submittedListing(lenderPage.request, approved, roto.id, zone.id);
  await submittedListing(lenderPage.request, rejected, roto.id, zone.id);

  // Moderador: rol interno (cierra sus sesiones), vuelve a entrar y confirma el segundo paso.
  moderator = await browser.newContext({ baseURL: info.project.use.baseURL });
  modPage = await moderator.newPage();
  const modEmail = await verifiedAccount(modPage);
  await grantRole(modEmail, "moderator");
  await signin(modPage, modEmail);
  await modPage.getByLabel("Código de verificación").fill(await mailedCode(modEmail, CODE_MAIL.twoFactor));
  await modPage.getByRole("button", { name: "Continuar" }).click();
  await expect(modPage.getByRole("heading", { name: /^Hola/ })).toBeVisible();
});

test.afterAll(async () => {
  await lender?.close();
  await moderator?.close();
});

test("el moderador entra solo a la moderación", async () => {
  await modPage.getByRole("link", { name: "Moderación" }).click();
  await expect(modPage).toHaveURL(/\/admin\/moderacion$/);
  await expect(modPage.getByRole("heading", { level: 1, name: "Moderación" })).toBeVisible();
  const nav = modPage.getByRole("navigation", { name: "Secciones de administración" });
  await expect(nav.getByRole("link")).toHaveCount(1);
  await expect(modPage.getByRole("search", { name: "Búsqueda rápida" })).toHaveCount(0);
  await expectAccessible(modPage);

  // Las secciones del admin no son para él.
  await modPage.goto("/admin");
  await expect(modPage).toHaveURL(/\/admin\/moderacion$/);
  await modPage.goto("/admin/comisiones");
  await expect(modPage).toHaveURL(/\/unauthorized$/);
});

test("aprobar una y rechazar otra con motivo", async () => {
  await modPage.goto("/admin/moderacion");
  const first = modPage.getByRole("article", { name: approved });
  await expect(first.getByText("Primera publicación")).toBeVisible();
  await expect(first.getByText("Bosch")).toBeVisible(); // atributo heredado de Construcción
  await expect(first.getByRole("img")).toHaveCount(3);
  await first.getByRole("button", { name: `Aprobar ${approved}` }).click();
  await expect(first).toHaveCount(0);

  const second = modPage.getByRole("article", { name: rejected });
  await second.getByRole("button", { name: `Rechazar ${rejected}` }).click();
  await second.getByRole("button", { name: "Rechazar con este motivo" }).click();
  await expect(second.getByText("Escribe el motivo")).toBeVisible();
  await second.getByLabel("Motivo del rechazo").fill("La foto de portada no muestra la herramienta.");
  await second.getByRole("button", { name: "Rechazar con este motivo" }).click();
  await expect(second).toHaveCount(0);
});

test("el arrendador ve la decisión", async () => {
  await lenderPage.goto("/dashboard/publicaciones");
  const ok = lenderPage.getByRole("article", { name: approved });
  await expect(ok.getByText("Publicada", { exact: true })).toBeVisible();
  const fix = lenderPage.getByRole("article", { name: rejected });
  await expect(fix.getByText("Por corregir", { exact: true })).toBeVisible();
  await expect(fix.getByText("La foto de portada no muestra la herramienta.")).toBeVisible();
});

test("bloquear y liberar fechas en el calendario", async () => {
  test.setTimeout(60_000); // el editor completo (con el mapa) tarda en abrir
  await lenderPage.getByRole("link", { name: `Editar ${approved}` }).click();
  const calendar = lenderPage.getByRole("region", { name: "Calendario" });
  await expect(calendar.getByText("No hay días bloqueados en el próximo año.")).toBeVisible();

  // Dos días del mes siguiente (el calendario abre en el mes actual).
  await calendar.getByRole("button", { name: /siguiente/i }).first().click();
  await calendar.getByRole("button", { name: /\b10 de\b/ }).first().click();
  await calendar.getByRole("button", { name: /\b12 de\b/ }).first().click();
  await calendar.getByLabel("Nota para ti (opcional)").fill("Mantenimiento");
  await calendar.getByRole("button", { name: "Bloquear estas fechas" }).click();
  await expect(calendar.getByText(/^Bloqueamos /)).toBeVisible();
  await expect(calendar.getByText("Bloqueado por ti")).toBeVisible();
  await expect(calendar.getByText("Mantenimiento")).toBeVisible();
  await expectAccessible(lenderPage);

  await calendar.getByRole("button", { name: /^Liberar / }).click();
  await expect(calendar.getByText("No hay días bloqueados en el próximo año.")).toBeVisible();
});
