import { NextResponse, type NextRequest } from "next/server";
import { clearSessionCookie } from "@/lib/bff";
import { NEXT_PARAM, ROUTES, safeNextPath } from "@/lib/session";

// GET /api/auth/expired: la cookie existe pero qatu-api ya no reconoce la sesión (venció, se
// cerró en otro dispositivo o cambió la contraseña). Se borra y se vuelve a iniciar sesión.
// Sin esto, proxy.ts vería la cookie y devolvería al panel en un ciclo.
export function GET(req: NextRequest) {
  const signin = new URL(ROUTES.signin, req.url);
  signin.searchParams.set(NEXT_PARAM, safeNextPath(req.nextUrl.searchParams.get(NEXT_PARAM)));
  const res = NextResponse.redirect(signin);
  clearSessionCookie(res);
  return res;
}
