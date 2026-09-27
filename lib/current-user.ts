// Usuario de la sesión para Server Components de las páginas protegidas.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { backendFetch, type ApiUser } from "./api";
import { NEXT_PARAM, ROUTES, SESSION_COOKIE } from "./session";

/**
 * Pide GET /me a qatu-api con el token de la cookie. Sin sesión va a iniciar sesión; si el API
 * ya no la reconoce, pasa por /api/auth/expired, que borra la cookie (un Server Component no puede).
 * returnTo: ruta a la que se vuelve después de iniciar sesión otra vez.
 */
export async function getCurrentUser(returnTo: string = ROUTES.dashboard): Promise<ApiUser> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const next = `?${NEXT_PARAM}=${encodeURIComponent(returnTo)}`;
  if (!token) redirect(ROUTES.signin + next);

  const res = await backendFetch("/me", {}, { token });
  if (res.status === 401) redirect("/api/auth/expired" + next);
  if (!res.ok) throw new Error(`qatu-api GET /me respondió ${res.status}`);
  return res.json();
}
