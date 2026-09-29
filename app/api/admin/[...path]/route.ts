import type { NextRequest } from "next/server";
import { errorResponse, forwardGet, forwardJson } from "@/lib/bff";

// /api/admin/* → qatu-api /admin/*. qatu-api exige sesión, rol admin y segundo paso en cada ruta:
// aquí solo se reenvía, sin reglas propias. "." y ".." se rechazan para no salir de /admin.
async function adminPath(req: NextRequest, ctx: RouteContext<"/api/admin/[...path]">) {
  const { path } = await ctx.params;
  if (path.some((segment) => segment === "." || segment === ".." || segment === "")) return null;
  return `/admin/${path.map(encodeURIComponent).join("/")}${req.nextUrl.search}`;
}

const notFound = () => errorResponse(404, "no_encontrado", "No existe.");

export async function GET(req: NextRequest, ctx: RouteContext<"/api/admin/[...path]">) {
  const path = await adminPath(req, ctx);
  return path ? forwardGet(req, path) : notFound();
}

async function forward(req: NextRequest, ctx: RouteContext<"/api/admin/[...path]">, method: "POST" | "PUT" | "PATCH") {
  const path = await adminPath(req, ctx);
  return path ? forwardJson(req, path, { method }) : notFound();
}

export const POST = (req: NextRequest, ctx: RouteContext<"/api/admin/[...path]">) => forward(req, ctx, "POST");
export const PUT = (req: NextRequest, ctx: RouteContext<"/api/admin/[...path]">) => forward(req, ctx, "PUT");
export const PATCH = (req: NextRequest, ctx: RouteContext<"/api/admin/[...path]">) => forward(req, ctx, "PATCH");
