// Cliente server-side hacia qatu-api. El navegador nunca llama al backend directo.
const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8080";

/** Datos de la petición original que el BFF reenvía a qatu-api. */
export interface BackendContext {
  /** Token de la cookie de sesión; va como Bearer. */
  token?: string;
  /** IP real del usuario: qatu-api limita intentos por IP y la registra en la auditoría. */
  clientIp?: string;
  userAgent?: string;
  /** Token del widget de Cloudflare Turnstile (registro y recuperación). */
  turnstileToken?: string;
}

export function backendFetch(path: string, init: RequestInit = {}, ctx: BackendContext = {}) {
  const headers = new Headers(init.headers);
  if (ctx.token) headers.set("Authorization", `Bearer ${ctx.token}`);
  if (ctx.clientIp) headers.set("X-Forwarded-For", ctx.clientIp);
  if (ctx.userAgent) headers.set("User-Agent", ctx.userAgent);
  if (ctx.turnstileToken) headers.set("X-Turnstile-Token", ctx.turnstileToken);
  return fetch(`${API_BASE_URL}/api/v1${path}`, { ...init, headers, cache: "no-store" });
}

/** Error público de qatu-api: {"error": "codigo", "message": "texto"}. */
export interface ApiError {
  error: string;
  message: string;
}

/** Vista pública del usuario (GET /me y respuestas de acceso). */
export interface ApiUser {
  id: string;
  email?: string;
  email_verified: boolean;
  name: string;
  avatar_url?: string;
  roles: string[];
  status: "active" | "suspended";
  verification_level: number;
  can_transact: boolean;
}

/** Respuesta de POST /auth/register y /auth/login. */
export interface ApiAuthResponse {
  session: { token: string; expires_at: string };
  user: ApiUser;
  two_factor_required: boolean;
  verification_sent?: boolean;
}
