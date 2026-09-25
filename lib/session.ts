// Cookies de sesión que el BFF setea tras el login contra qatu-api.
export const SESSION_COOKIES = {
  token: "qatu_token",
  user: "qatu_user",
  expiresAt: "qatu_expires_at",
} as const;

export const ROUTES = {
  home: "/",
  signin: "/auth/signin",
  dashboard: "/dashboard",
  unauthorized: "/unauthorized",
} as const;
