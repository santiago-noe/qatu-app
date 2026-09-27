import { NextResponse, type NextRequest } from "next/server";
import { backendFetch } from "@/lib/api";
import { backendContext, backendUnreachable, errorResponse, isJson, passError } from "@/lib/bff";
import { saveFlow } from "@/lib/google-auth";
import { safeNextPath } from "@/lib/session";

interface StartRequest {
  adult_declared?: boolean;
  accept_legal?: boolean;
  next?: string;
  from?: "signin" | "signup";
}

// POST /api/auth/google/start → {url}. Es POST con JSON (no un enlace GET) para que nadie
// arme un enlace que "acepte" los términos por otra persona. El navegador luego va a url.
export async function POST(req: NextRequest) {
  if (!isJson(req)) return errorResponse(415, "solicitud_invalida", "El cuerpo debe ser JSON.");
  const body = (await req.json().catch(() => ({}))) as StartRequest;

  let res: Response;
  try {
    res = await backendFetch(
      "/auth/google/start",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adult_declared: body.adult_declared === true, accept_legal: body.accept_legal === true }),
      },
      backendContext(req),
    );
  } catch {
    return backendUnreachable();
  }
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) return passError(res, data);

  const { url, state } = data as { url: string; state: string };
  const out = NextResponse.json({ url });
  saveFlow(out, { state, next: safeNextPath(body.next), from: body.from === "signup" ? "signup" : "signin" });
  return out;
}
