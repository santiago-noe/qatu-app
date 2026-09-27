import { NextResponse, type NextRequest } from "next/server";
import { backendFetch, type ApiAuthResponse } from "@/lib/api";
import { backendContext, setSessionCookie } from "@/lib/bff";
import { backToAuthPage, clearFlow, readFlow } from "@/lib/google-auth";

// GET /api/auth/google/callback: aquí vuelve Google (URI de redireccionamiento autorizada).
// Comprueba que el state sea el de este navegador, pide a qatu-api que canjee el código y deja
// la sesión en la cookie. Cualquier fallo vuelve a la pantalla de acceso con un código de error.
export async function GET(req: NextRequest) {
  const flow = readFlow(req);
  const from = flow?.from ?? "signin";
  const params = req.nextUrl.searchParams;

  const googleError = params.get("error"); // la persona canceló o Google rechazó la solicitud
  if (googleError) return backToAuthPage(req, from, googleError === "access_denied" ? "google_cancelado" : "google_fallido");

  const code = params.get("code");
  const state = params.get("state");
  if (!flow || !code || !state || state !== flow.state) return backToAuthPage(req, from, "google_estado_invalido");

  let res: Response;
  try {
    res = await backendFetch(
      "/auth/google/callback",
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, state }) },
      backendContext(req),
    );
  } catch {
    return backToAuthPage(req, from, "servicio_no_disponible");
  }
  const body = (await res.json().catch(() => null)) as (ApiAuthResponse & { error?: string }) | null;
  if (!res.ok || !body?.session) return backToAuthPage(req, from, body?.error ?? "google_fallido");

  const out = NextResponse.redirect(new URL(flow.next, req.url));
  setSessionCookie(out, body.session.token, new Date(body.session.expires_at));
  clearFlow(out);
  return out;
}
