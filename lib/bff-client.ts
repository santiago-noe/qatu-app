// Llamadas del navegador al BFF (app/api). Nunca a qatu-api directo.
import type { ApiError } from "./api";

export type BffResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };

interface CallOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Token de Cloudflare Turnstile para formularios públicos (registro, recuperación). */
  turnstileToken?: string | null;
}

const NETWORK_ERROR: ApiError = {
  error: "sin_conexion",
  message: "No pudimos conectar. Revisa tu internet e inténtalo de nuevo.",
};

/** Llama al BFF y devuelve los datos o el error de qatu-api ({error, message}), sin lanzar. */
export async function callBff<T>(path: string, opts: CallOptions = {}): Promise<BffResult<T>> {
  const method = opts.method ?? (opts.body === undefined ? "GET" : "POST");
  const headers: Record<string, string> = {};
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.turnstileToken) headers["X-Turnstile-Token"] = opts.turnstileToken;
  let res: Response;
  try {
    res = await fetch(path, {
      method,
      headers,
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    });
  } catch {
    return { ok: false, error: NETWORK_ERROR };
  }
  const data = res.status === 204 || res.status === 202 ? undefined : await res.json().catch(() => undefined);
  if (res.ok) return { ok: true, data: data as T };
  const error = data && typeof data === "object" && "error" in data ? (data as ApiError) : NETWORK_ERROR;
  return { ok: false, error };
}
