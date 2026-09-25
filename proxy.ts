import { NextResponse, type NextRequest } from "next/server";
import { ROUTES, SESSION_COOKIES } from "@/lib/session";

const PROTECTED_PREFIXES = ["/dashboard"];
const GUEST_ONLY_PREFIXES = [
  "/auth/signin",
  "/auth/recovery-account",
  "/auth/set-password",
];

const matches = (path: string, prefixes: string[]) =>
  prefixes.some((p) => path === p || path.startsWith(`${p}/`));

function hasValidSession(req: NextRequest): boolean {
  const token = req.cookies.get(SESSION_COOKIES.token)?.value;
  const user = req.cookies.get(SESSION_COOKIES.user)?.value;
  const expiresAt = Number(req.cookies.get(SESSION_COOKIES.expiresAt)?.value);
  return Boolean(token && user && expiresAt && expiresAt > Date.now());
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authenticated = hasValidSession(req);

  if (matches(pathname, PROTECTED_PREFIXES) && !authenticated) {
    return NextResponse.redirect(new URL(ROUTES.signin, req.url));
  }
  if (
    (pathname === ROUTES.home || matches(pathname, GUEST_ONLY_PREFIXES)) &&
    authenticated
  ) {
    return NextResponse.redirect(new URL(ROUTES.dashboard, req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/auth/:path*"],
};
