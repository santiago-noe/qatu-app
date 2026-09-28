import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { Page } from "@playwright/test";

// Utilidades compartidas por las pruebas e2e (no es un archivo de pruebas: no termina en .e2e.ts).

// El flujo completo necesita qatu-api (docker compose + make run) sin secreto de Turnstile.
const API_HEALTH = `${process.env.API_BASE_URL ?? "http://localhost:8080"}/api/v1/health`;

export const PASSWORD = "una frase larga de prueba";
// El registro calcula argon2 y envía el correo: con varias pruebas en paralelo puede tardar.
export const AFTER_SIGNUP = { timeout: 15_000 };
// Tras registrarse se confirma el correo (o se deja para después).
export const VERIFY_EMAIL_URL = /\/auth\/verify-email$/;

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

// Bandeja de Mailpit (docker compose de qatu-api): recibe todos los correos en desarrollo.
const MAILPIT = process.env.MAILPIT_URL ?? "http://localhost:8025";

/** Asuntos de los correos con código (qatu-api, internal/adapter/outbound/smtp/mailer.go). */
export const CODE_MAIL = {
  verifyEmail: "Tu código de verificación de Qatu",
  passwordReset: "Tu código para recuperar tu contraseña de Qatu",
  twoFactor: "Tu código de acceso a Qatu",
} as const;

/**
 * Código del último correo de ese tipo a esa dirección. El asunto termina en el código
 * ("…de Qatu: 123456"). except: espera a uno distinto (tras pedir que se reenvíe).
 */
export async function mailedCode(to: string, subject: string, except?: string): Promise<string> {
  const query = encodeURIComponent(`to:"${to}" subject:"${subject}"`);
  for (let attempt = 0; attempt < 40; attempt++) {
    const res = await fetch(`${MAILPIT}/api/v1/search?query=${query}&limit=1`);
    const { messages } = (await res.json()) as { messages?: { Subject: string }[] };
    const code = messages?.[0]?.Subject.match(/(\d{6})$/)?.[1];
    if (code && code !== except) return code;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`No llegó a Mailpit el correo "${subject}" para ${to}`);
}

/** Da un rol interno con la herramienta de qatu-api (go run ./cmd/admin); cierra sus sesiones. */
export async function grantRole(email: string, role: "support" | "moderator" | "admin") {
  await promisify(execFile)("go", ["run", "./cmd/admin", "grant", email, role], {
    cwd: process.env.QATU_API_DIR ?? "../qatu-api",
    timeout: 120_000,
  });
}

/** Inicia sesión por el formulario. */
export async function signin(page: Page, email: string, password: string = PASSWORD) {
  await page.goto("/auth/signin");
  await page.getByLabel("Correo").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
}
