// Utilidades de los route handlers del BFF (app/api): reenvían a qatu-api y manejan la cookie.
import { NextResponse, type NextRequest } from "next/server";
import { backendFetch, type ApiAuthResponse, type ApiError, type BackendContext } from "./api";
import { SESSION_COOKIE } from "./session";

/**
 * IP del usuario: la última de X-Forwarded-For, la que agrega gateway.js al recibir la conexión.
 * Las anteriores las escribe el cliente y no son confiables.
 */
export function clientIp(forwardedFor: string | null): string | undefined {
  return forwardedFor?.split(",").at(-1)?.trim() || undefined;
}

export function backendContext(req: NextRequest): BackendContext {
  return {
    token: req.cookies.get(SESSION_COOKIE)?.value,
    clientIp: clientIp(req.headers.get("x-forwarded-for")),
    userAgent: req.headers.get("user-agent") ?? undefined,
    turnstileToken: req.headers.get("x-turnstile-token") ?? undefined,
  };
}

export function errorResponse(status: number, error: string, message: string) {
  return NextResponse.json<ApiError>({ error, message }, { status });
}

export const backendUnreachable = () =>
  errorResponse(502, "servicio_no_disponible", "No pudimos conectar con Qatu. Inténtalo en unos minutos.");

// Solo JSON: un formulario de otro sitio no puede enviar este tipo sin permiso CORS.
export const isJson = (req: NextRequest) => req.headers.get("content-type")?.startsWith("application/json") ?? false;

/** Devuelve el error de qatu-api tal cual (código y mensaje en español) con su Retry-After. */
export function passError(res: Response, body: unknown) {
  if (!body || typeof body !== "object" || !("error" in body)) return backendUnreachable();
  const out = NextResponse.json(body, { status: res.status });
  const retryAfter = res.headers.get("retry-after");
  if (retryAfter) out.headers.set("Retry-After", retryAfter);
  return out;
}

interface ForwardOptions {
  method?: "POST" | "PUT" | "PATCH" | "DELETE";
  /** Registro o inicio de sesión: el token va a la cookie httpOnly y sale del cuerpo. */
  startsSession?: boolean;
}

/**
 * Reenvía un cuerpo JSON a qatu-api (POST por defecto). Si es un acceso, guarda el token en la
 * cookie httpOnly y lo quita del cuerpo: el navegador nunca lo ve.
 */
export async function forwardJson(req: NextRequest, path: string, opts: ForwardOptions = {}) {
  if (!isJson(req)) return errorResponse(415, "solicitud_invalida", "El cuerpo debe ser JSON.");
  let res: Response;
  try {
    res = await backendFetch(
      path,
      { method: opts.method ?? "POST", headers: { "Content-Type": "application/json" }, body: await req.text() },
      backendContext(req),
    );
  } catch {
    return backendUnreachable();
  }
  if (res.status === 202 || res.status === 204) return new NextResponse(null, { status: res.status });

  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) return passError(res, body);
  if (!opts.startsSession) return NextResponse.json(body, { status: res.status });

  const { session, ...rest } = body as ApiAuthResponse;
  const out = NextResponse.json(rest, { status: res.status });
  setSessionCookie(out, session.token, new Date(session.expires_at));
  return out;
}

/**
 * Reenvía un GET a qatu-api con la sesión del navegador (si la hay) y copia su Cache-Control:
 * el catálogo público se puede reutilizar unos minutos.
 */
export async function forwardGet(req: NextRequest, path: string) {
  let res: Response;
  try {
    res = await backendFetch(path, {}, backendContext(req));
  } catch {
    return backendUnreachable();
  }
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) return passError(res, body);
  const out = NextResponse.json(body);
  const cacheControl = res.headers.get("cache-control");
  if (cacheControl) out.headers.set("Cache-Control", cacheControl);
  return out;
}

export function setSessionCookie(res: NextResponse, token: string, expires: Date) {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.delete(SESSION_COOKIE);
}
