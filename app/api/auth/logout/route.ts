import { NextResponse, type NextRequest } from "next/server";
import { backendFetch } from "@/lib/api";
import { backendContext, clearSessionCookie } from "@/lib/bff";

// POST /api/auth/logout: cierra la sesión en qatu-api y borra la cookie. La cookie se borra
// aunque el API no responda: en este dispositivo la sesión termina igual.
export async function POST(req: NextRequest) {
  const ctx = backendContext(req);
  if (ctx.token) {
    await backendFetch("/auth/logout", { method: "POST" }, ctx).catch(() => undefined);
  }
  const res = new NextResponse(null, { status: 204 });
  clearSessionCookie(res);
  return res;
}
