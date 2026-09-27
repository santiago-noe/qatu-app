// Sesión del BFF: una sola cookie httpOnly con el token opaco de qatu-api.
// El navegador nunca lo lee; los datos del usuario se piden a GET /me.
// Mismo nombre que APP__SESSION__COOKIE_NAME en qatu-api.
export const SESSION_COOKIE = "qatu_session";

export const ROUTES = {
  home: "/",
  signin: "/auth/signin",
  signup: "/auth/signup",
  recovery: "/auth/recovery-account",
  dashboard: "/dashboard",
  unauthorized: "/unauthorized",
  terms: "/terminos",
  privacy: "/privacidad",
} as const;

// Parámetro con la ruta a la que se vuelve después de iniciar sesión.
export const NEXT_PARAM = "next";

/**
 * Devuelve la ruta interna de destino tras iniciar sesión. Solo acepta rutas propias
 * ("/algo", nunca "//dominio" ni URL absolutas) para no abrir redirecciones a otros sitios.
 */
export function safeNextPath(raw: string | null | undefined, fallback: string = ROUTES.dashboard): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  return raw;
}
