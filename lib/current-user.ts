// Datos de la sesión para Server Components de las páginas protegidas.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { backendFetch, type ApiUser } from "./api";
import { ROUTES, SESSION_COOKIE, withNext } from "./session";

/**
 * GET a qatu-api con el token de la cookie. Sin sesión va a iniciar sesión; si el API ya no la
 * reconoce, pasa por /api/auth/expired, que borra la cookie (un Server Component no puede).
 * returnTo: ruta a la que se vuelve después de iniciar sesión otra vez.
 */
export async function authedGet<T>(path: string, returnTo: string = ROUTES.dashboard): Promise<T> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) redirect(withNext(ROUTES.signin, returnTo));

  const res = await backendFetch(path, {}, { token });
  if (res.status === 401) redirect(withNext("/api/auth/expired", returnTo));
  if (res.status === 403) {
    // Rutas internas: sin el segundo paso se pide el código; sin el rol, no hay acceso.
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    redirect(body?.error === "dos_pasos_requerido" ? withNext(ROUTES.twoFactor, returnTo) : ROUTES.unauthorized);
  }
  if (!res.ok) throw new Error(`qatu-api GET ${path} respondió ${res.status}`);
  return res.json() as Promise<T>;
}

/** Usuario de la sesión (GET /me). */
export function getCurrentUser(returnTo?: string): Promise<ApiUser> {
  return authedGet<ApiUser>("/me", returnTo);
}
