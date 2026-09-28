import type { Page } from "@playwright/test";

// Utilidades compartidas por las pruebas e2e (no es un archivo de pruebas: no termina en .e2e.ts).

// El flujo completo necesita qatu-api (docker compose + make run) sin secreto de Turnstile.
const API_HEALTH = `${process.env.API_BASE_URL ?? "http://localhost:8080"}/api/v1/health`;

export const PASSWORD = "una frase larga de prueba";
// El registro calcula argon2 y envía el correo: con varias pruebas en paralelo puede tardar.
export const AFTER_SIGNUP = { timeout: 15_000 };

export async function apiAvailable() {
  try {
    return (await fetch(API_HEALTH)).ok;
  } catch {
    return false;
  }
}

export const uniqueEmail = () => `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@qatu.pe`;

/** Registra una cuenta nueva por el formulario (queda con la sesión iniciada). */
export async function signup(page: Page, email: string = uniqueEmail()) {
  await page.goto("/auth/signup");
  await page.getByLabel("Nombre y apellido").fill("Ana Quispe");
  await page.getByLabel("Correo").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(PASSWORD);
  await page.getByLabel("Declaro que soy mayor de 18 años.").check();
  await page.getByLabel(/Acepto los/).check();
  await page.getByRole("button", { name: "Crear mi cuenta" }).click();
  return email;
}
