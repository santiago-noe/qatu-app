import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import {
  AFTER_SIGNUP,
  apiAvailable,
  CODE_MAIL,
  grantRole,
  mailedCode,
  signin,
  signup,
  uniqueEmail,
  VERIFY_EMAIL_URL,
} from "./helpers";

// Flujos con código por correo: confirmar el correo, recuperar la contraseña y el segundo paso.
// Necesitan qatu-api y Mailpit (docker compose de qatu-api).
test.beforeEach(async () => {
  test.skip(!(await apiAvailable()), "qatu-api no está corriendo");
});

const noViolations = async (page: Page) =>
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

test("confirmar el correo después de registrarse", async ({ page }) => {
  const email = await signup(page);
  await expect(page).toHaveURL(VERIFY_EMAIL_URL, AFTER_SIGNUP);
  await expect(page.getByText(email)).toBeVisible();
  await noViolations(page);

  // Un código equivocado se marca en su campo.
  await page.getByLabel("Código de verificación").fill("000000");
  await page.getByRole("button", { name: "Confirmar mi correo" }).click();
  await expect(page.getByLabel("Código de verificación")).toHaveAttribute("aria-invalid", "true");

  await page.getByLabel("Código de verificación").fill(await mailedCode(email, CODE_MAIL.verifyEmail));
  await page.getByRole("button", { name: "Confirmar mi correo" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText("Correo verificado.")).toBeVisible();

  // Ya confirmado, la pantalla lleva al panel.
  await page.goto("/auth/verify-email");
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("reenviar el código invalida el anterior y espera un minuto", async ({ page }) => {
  const email = await signup(page);
  await expect(page).toHaveURL(VERIFY_EMAIL_URL, AFTER_SIGNUP);
  const first = await mailedCode(email, CODE_MAIL.verifyEmail);

  // El registro acaba de enviar uno: qatu-api pide esperar y el botón queda en cuenta regresiva.
  await page.getByRole("button", { name: "Reenviar código" }).click();
  await expect(page.getByRole("button", { name: /Reenviar código en \d+ s/ })).toBeDisabled();
  expect(await mailedCode(email, CODE_MAIL.verifyEmail)).toBe(first);
});

test("recuperar la contraseña con el código del correo", async ({ page, context }) => {
  const email = await signup(page);
  await expect(page).toHaveURL(VERIFY_EMAIL_URL, AFTER_SIGNUP);
  await context.clearCookies();

  await page.goto("/auth/recovery-account");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByRole("button", { name: "Enviarme el código" }).click();
  await expect(page.getByRole("heading", { name: "Crea una contraseña nueva" })).toBeVisible();
  await noViolations(page);

  const newPassword = "otra frase larga para entrar";
  await page.getByLabel("Código de verificación").fill(await mailedCode(email, CODE_MAIL.passwordReset));
  await page.getByLabel("Contraseña nueva").fill(newPassword);
  await page.getByRole("button", { name: "Guardar contraseña" }).click();
  await expect(page.getByRole("heading", { name: "Tu contraseña cambió" })).toBeVisible();

  await page.getByRole("link", { name: "Iniciar sesión" }).click();
  await signin(page, email, newPassword);
  await expect(page.getByRole("heading", { name: "Hola, Ana" })).toBeVisible();
});

test("un correo sin cuenta recibe la misma respuesta", async ({ page }) => {
  await page.goto("/auth/recovery-account");
  await page.getByLabel("Correo electrónico").fill(uniqueEmail());
  await page.getByRole("button", { name: "Enviarme el código" }).click();
  await expect(page.getByRole("heading", { name: "Crea una contraseña nueva" })).toBeVisible();
});

test("un rol interno confirma el segundo paso antes de seguir", async ({ page }) => {
  test.setTimeout(120_000); // go run compila la herramienta la primera vez
  const email = await signup(page);
  await expect(page).toHaveURL(VERIFY_EMAIL_URL, AFTER_SIGNUP);
  try {
    await grantRole(email, "admin"); // cierra sus sesiones
  } catch {
    test.skip(true, "No se pudo ejecutar go run ./cmd/admin en ../qatu-api");
  }

  await signin(page, email);
  await expect(page).toHaveURL(/\/auth\/two-factor\?next=%2Fdashboard$/);
  // El código se envía al abrir la pantalla.
  const code = await mailedCode(email, CODE_MAIL.twoFactor);
  await noViolations(page);

  await page.getByLabel("Código de verificación").fill(code);
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByRole("heading", { name: "Hola, Ana" })).toBeVisible();

  // Pasado el segundo paso, volver a la pantalla no pide otro código.
  await page.goto("/auth/two-factor");
  await expect(page).toHaveURL(/\/dashboard$/);
});
