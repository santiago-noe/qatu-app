import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { AFTER_SIGNUP, apiAvailable, PASSWORD, signup, uniqueEmail } from "./helpers";

test.describe("sin API", () => {
  test("el registro valida en el navegador y lleva el foco al primer error", async ({ page }) => {
    await page.goto("/auth/signup");
    await page.getByRole("button", { name: "Crear mi cuenta" }).click();
    await expect(page.getByText("Escribe tu nombre.")).toBeVisible();
    await expect(page.getByText("Escribe tu correo.")).toBeVisible();
    await expect(page.getByText("Debes ser mayor de 18 años para crear una cuenta.")).toBeVisible();
    await expect(page.getByLabel("Nombre y apellido")).toBeFocused();
  });

  test("registrarse con Google pide antes las casillas y no sale del sitio", async ({ page }) => {
    await page.goto("/auth/signup");
    await page.getByRole("button", { name: "Continuar con Google" }).click();
    await expect(page.getByText("Acepta los términos y la política de privacidad para continuar.")).toBeVisible();
    // El foco baja a la casilla que falta, aunque esté al final del formulario.
    await expect(page.getByLabel("Declaro que soy mayor de 18 años.")).toBeFocused();
    await expect(page).toHaveURL(/\/auth\/signup$/);
  });

  test("volver de Google sin un state válido muestra un aviso", async ({ page }) => {
    await page.goto("/api/auth/google/callback?code=robado&state=ajeno");
    await expect(page).toHaveURL(/\/auth\/signin\?error=google_estado_invalido/);
    await expect(page.getByRole("alert").filter({ hasText: "El acceso con Google venció" })).toBeVisible();
  });

  test("un código de error inventado en la URL no muestra su texto", async ({ page }) => {
    await page.goto("/auth/signin?error=Llama%20al%20999%20para%20desbloquear");
    await expect(page.getByText("999")).toHaveCount(0);
    await expect(page.getByRole("alert").filter({ hasText: "No pudimos completar el acceso con Google" })).toBeVisible();
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
    await expect(page).toHaveURL(/\/dashboard$/, AFTER_SIGNUP);
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
    await expect(page).toHaveURL(/\/dashboard$/, AFTER_SIGNUP);
    await context.clearCookies();

    await signup(page, email);
    await expect(page.getByText("el correo ya está registrado")).toBeVisible();
    await expect(page.getByLabel("Correo")).toBeFocused();
  });

  test("Continuar con Google lleva a Google con PKCE y el state", async ({ page }) => {
    await page.goto("/auth/signin");
    // No se sigue hasta Google: basta con ver la URL a la que el navegador intenta ir.
    await page.route("https://accounts.google.com/**", (route) => route.fulfill({ status: 200, body: "google" }));
    await page.getByRole("button", { name: "Continuar con Google" }).click();
    await page.waitForURL(/accounts\.google\.com/);
    // Requiere qatu-api con APP__GOOGLE__CLIENT_ID (sin él, el botón muestra "no disponible").
    const url = new URL(page.url());
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("state")).toBeTruthy();
    expect(url.searchParams.get("redirect_uri")).toBe("http://localhost:3000/api/auth/google/callback");
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
