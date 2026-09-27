import { NextResponse, type NextRequest } from "next/server";
import { NEXT_PARAM, ROUTES, SESSION_COOKIE } from "@/lib/session";

const PROTECTED_PREFIXES = [ROUTES.dashboard];
const GUEST_ONLY_PREFIXES = [
  ROUTES.signin,
  ROUTES.signup,
  ROUTES.recovery,
  "/auth/set-password",
];

const matches = (path: string, prefixes: string[]) =>
  prefixes.some((p) => path === p || path.startsWith(`${p}/`));

// Filtro rápido por la cookie: vence junto con la sesión. Si el API la revocó antes,
// la página protegida lo detecta al pedir /me y la borra (app/api/auth/expired).
const hasSession = (req: NextRequest) => Boolean(req.cookies.get(SESSION_COOKIE)?.value);

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const authenticated = hasSession(req);

  if (matches(pathname, PROTECTED_PREFIXES) && !authenticated) {
    const signin = new URL(ROUTES.signin, req.url);
    signin.searchParams.set(NEXT_PARAM, pathname + search);
    return NextResponse.redirect(signin);
  }
  if ((pathname === ROUTES.home || matches(pathname, GUEST_ONLY_PREFIXES)) && authenticated) {
    return NextResponse.redirect(new URL(ROUTES.dashboard, req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/auth/:path*"],
};
