// Flujo "Continuar con Google" en el BFF: ida (start) y vuelta (callback) comparten esta cookie.
import { NextResponse, type NextRequest } from "next/server";
import { ROUTES, safeNextPath } from "./session";

const COOKIE = "qatu_oauth";
// Solo viaja a las rutas del flujo, no al resto del sitio.
const COOKIE_PATH = "/api/auth/google";
const TTL_SECONDS = 10 * 60; // igual que el state en qatu-api

export type AuthPage = "signin" | "signup";

/** Lo que el BFF recuerda entre la ida a Google y la vuelta. */
export interface OAuthFlow {
  /** Debe coincidir con el state que vuelve de Google: nadie puede iniciar el flujo por otra persona. */
  state: string;
  next: string;
  from: AuthPage;
}

export function saveFlow(res: NextResponse, flow: OAuthFlow) {
  res.cookies.set(COOKIE, JSON.stringify(flow), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // Lax: la cookie viaja en la redirección de vuelta desde Google (navegación GET de primer nivel).
    sameSite: "lax",
    path: COOKIE_PATH,
    maxAge: TTL_SECONDS,
  });
}

export function readFlow(req: NextRequest): OAuthFlow | null {
  try {
    const flow = JSON.parse(req.cookies.get(COOKIE)?.value ?? "") as Partial<OAuthFlow>;
    if (typeof flow.state !== "string" || !flow.state) return null;
    return { state: flow.state, next: safeNextPath(flow.next), from: flow.from === "signup" ? "signup" : "signin" };
  } catch {
    return null;
  }
}

export function clearFlow(res: NextResponse) {
  res.cookies.delete({ name: COOKIE, path: COOKIE_PATH });
}

/**
 * Vuelve a la pantalla de acceso con un código de error; la pantalla elige el texto (nunca se
 * muestra texto que venga en la URL). Sin cuenta, se va al registro para aceptar los términos.
 */
export function backToAuthPage(req: NextRequest, from: AuthPage, error: string) {
  const page = error === "registro_requerido" || from === "signup" ? ROUTES.signup : ROUTES.signin;
  const url = new URL(page, req.url);
  url.searchParams.set("error", error);
  const res = NextResponse.redirect(url);
  clearFlow(res);
  return res;
}
