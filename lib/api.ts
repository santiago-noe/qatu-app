// Cliente server-side hacia qatu-api. El navegador nunca llama al backend directo.
const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8080";

export function backendFetch(path: string, init?: RequestInit) {
  return fetch(`${API_BASE_URL}/api/v1${path}`, {
    ...init,
    cache: "no-store",
  });
}
