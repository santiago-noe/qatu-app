import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// El flujo completo necesita qatu-api (docker compose + make run) sin secreto de Turnstile.
const API_HEALTH = `${process.env.API_BASE_URL ?? "http://localhost:8080"}/api/v1/health`;
const PASSWORD = "una frase larga de prueba";

async function apiAvailable() {
  try {
    return (await fetch(API_HEALTH)).ok;
  } catch {
    return false;
  }
}

const uniqueEmail = () => `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@qatu.pe`;

async function signup(page: Page, email: string) {
  await page.goto("/auth/signup");
  await page.getByLabel("Nombre y apellido").fill("Ana Quispe");
  await page.getByLabel("Correo").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(PASSWORD);
  await page.getByLabel("Declaro que soy mayor de 18 años.").check();
  await page.getByLabel(/Acepto los/).check();
  await page.getByRole("button", { name: "Crear cuenta" }).click();
}

test.describe("sin API", () => {
  test("el registro valida en el navegador y lleva el foco al primer error", async ({ page }) => {
    await page.goto("/auth/signup");
    await page.getByRole("button", { name: "Crear cuenta" }).click();
    await expect(page.getByText("Escribe tu nombre.")).toBeVisible();
    await expect(page.getByText("Escribe tu correo.")).toBeVisible();
    await expect(page.getByText("Debes ser mayor de 18 años para crear una cuenta.")).toBeVisible();
    await expect(page.getByLabel("Nombre y apellido")).toBeFocused();
  });

  test("la contraseña se puede mostrar y ocultar", async ({ page }) => {
    await page.goto("/auth/signin");
    const password = page.getByLabel("Contraseña", { exact: true });
    await expect(password).toHaveAttribute("type", "password");
    await page.getByRole("button", { name: "Mostrar contraseña" }).click();
    await expect(password).toHaveAttribute("type", "text");
  });

  test("una ruta protegida sin sesión va a iniciar sesión y recuerda el destino", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/auth\/signin\?next=%2Fdashboard/);
  });

  for (const path of ["/auth/signin", "/auth/signup"]) {
    test(`${path} no tiene problemas de accesibilidad detectables`, async ({ page }) => {
      await page.goto(path);
      const { violations } = await new AxeBuilder({ page }).analyze();
      expect(violations).toEqual([]);
    });
  }
});

test.describe("con API", () => {
  test.beforeEach(async () => {
    test.skip(!(await apiAvailable()), "qatu-api no está corriendo");
  });

  test("registro, cierre de sesión e inicio de sesión", async ({ page, context }) => {
    const email = uniqueEmail();
    await signup(page, email);
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Hola, Ana" })).toBeVisible();
    await expect(page.getByText("Confirma tu correo")).toBeVisible();

    // El token vive solo en una cookie httpOnly.
    const [cookie] = (await context.cookies()).filter((c) => c.name === "qatu_session");
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("Lax");

    await page.getByRole("button", { name: "Cerrar sesión" }).click();
    await expect(page).toHaveURL(/\/$/);
    expect((await context.cookies()).some((c) => c.name === "qatu_session")).toBe(false);

    await page.goto("/auth/signin");
    await page.getByLabel("Correo").fill(email);
    await page.getByLabel("Contraseña", { exact: true }).fill(PASSWORD);
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await expect(page.getByRole("heading", { name: "Hola, Ana" })).toBeVisible();
  });

  test("un correo ya registrado se marca en su campo", async ({ page, context }) => {
    const email = uniqueEmail();
    await signup(page, email);
    await expect(page).toHaveURL(/\/dashboard$/);
    await context.clearCookies();

    await signup(page, email);
    await expect(page.getByText("el correo ya está registrado")).toBeVisible();
    await expect(page.getByLabel("Correo")).toBeFocused();
  });

  test("credenciales incorrectas muestran un aviso que no revela si el correo existe", async ({ page }) => {
    await page.goto("/auth/signin");
    await page.getByLabel("Correo").fill(uniqueEmail());
    await page.getByLabel("Contraseña", { exact: true }).fill("no-es-la-clave");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    // Next agrega su propio role="alert" (anunciador de rutas): se filtra por el texto.
    await expect(page.getByRole("alert").filter({ hasText: "correo o contraseña incorrectos" })).toBeVisible();
  });
});
