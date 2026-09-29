// Datos de la sesión para Server Components de las páginas protegidas.
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { backendFetch, type ApiUser } from "./api";
import { ROUTES, SESSION_COOKIE, withNext } from "./session";

/**
 * Un GET por ruta y por petición: el layout y la página comparten la respuesta (por ejemplo, /me).
 * status 0 = no hay cookie de sesión.
 */
const fetchWithSession = cache(async (path: string): Promise<{ status: number; body: unknown }> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return { status: 0, body: null };
  const res = await backendFetch(path, {}, { token });
  return { status: res.status, body: await res.json().catch(() => null) };
});

/**
 * GET a qatu-api con el token de la cookie. Sin sesión va a iniciar sesión; si el API ya no la
 * reconoce, pasa por /api/auth/expired, que borra la cookie (un Server Component no puede).
 * returnTo: ruta a la que se vuelve después de iniciar sesión otra vez.
 */
export async function authedGet<T>(path: string, returnTo: string = ROUTES.dashboard): Promise<T> {
  const { status, body } = await fetchWithSession(path);
  if (status === 0) redirect(withNext(ROUTES.signin, returnTo));
  if (status === 401) redirect(withNext("/api/auth/expired", returnTo));
  if (status === 403) {
    // Rutas internas: sin el segundo paso se pide el código; sin el rol, no hay acceso.
    const code = (body as { error?: string } | null)?.error;
    redirect(code === "dos_pasos_requerido" ? withNext(ROUTES.twoFactor, returnTo) : ROUTES.unauthorized);
  }
  if (status < 200 || status >= 300) throw new Error(`qatu-api GET ${path} respondió ${status}`);
  return body as T;
}

/** Usuario de la sesión (GET /me). */
export function getCurrentUser(returnTo?: string): Promise<ApiUser> {
  return authedGet<ApiUser>("/me", returnTo);
}
