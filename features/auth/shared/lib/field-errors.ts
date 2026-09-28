// Llamadas del navegador al BFF (app/api/auth). Nunca a qatu-api directo.
import type { ApiError } from "@/lib/api";

export type BffResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };

const NETWORK_ERROR: ApiError = {
  error: "sin_conexion",
  message: "No pudimos conectar. Revisa tu internet e inténtalo de nuevo.",
};

export async function postToBff<T>(
  path: string,
  body?: unknown,
  opts: { turnstileToken?: string | null } = {},
): Promise<BffResult<T>> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (opts.turnstileToken) headers["X-Turnstile-Token"] = opts.turnstileToken;
  let res: Response;
  try {
    res = await fetch(path, { method: "POST", headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    return { ok: false, error: NETWORK_ERROR };
  }
  const data = res.status === 204 || res.status === 202 ? undefined : await res.json().catch(() => undefined);
  if (res.ok) return { ok: true, data: data as T };
  const error = data && typeof data === "object" && "error" in data ? (data as ApiError) : NETWORK_ERROR;
  return { ok: false, error };
}

// Códigos de qatu-api (handler/errors.go) que corresponden a un campo del formulario.
// Los demás (credenciales, límite de intentos, captcha…) se muestran como aviso general.
const FIELD_BY_CODE: Record<string, string> = {
  correo_invalido: "email",
  correo_registrado: "email",
  contrasena_corta: "password",
  contrasena_larga: "password",
  contrasena_filtrada: "password",
  contrasena_igual_correo: "password",
  nombre_invalido: "name",
  mayoria_de_edad_requerida: "adult_declared",
  consentimiento_requerido: "accept_legal",
};

/** Campo del formulario al que pertenece el error, si el formulario lo tiene. */
export function fieldForError<F extends string>(code: string, fields: readonly F[]): F | undefined {
  const field = FIELD_BY_CODE[code];
  return fields.find((f) => f === field);
}
