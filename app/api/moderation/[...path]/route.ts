import type { NextRequest } from "next/server";
import { errorResponse, forwardGet, forwardJson } from "@/lib/bff";

// /api/moderation/* → qatu-api /moderation/* (feature 003). qatu-api exige sesión, rol moderator o
// admin y el segundo paso en cada ruta: aquí solo se reenvía.
async function moderationPath(req: NextRequest, ctx: RouteContext<"/api/moderation/[...path]">) {
  const { path } = await ctx.params;
  if (path.some((segment) => segment === "." || segment === ".." || segment === "")) return null;
  return `/moderation/${path.map(encodeURIComponent).join("/")}${req.nextUrl.search}`;
}

const notFound = () => errorResponse(404, "no_encontrado", "No existe.");

export async function GET(req: NextRequest, ctx: RouteContext<"/api/moderation/[...path]">) {
  const path = await moderationPath(req, ctx);
  return path ? forwardGet(req, path) : notFound();
}

export async function POST(req: NextRequest, ctx: RouteContext<"/api/moderation/[...path]">) {
  const path = await moderationPath(req, ctx);
  return path ? forwardJson(req, path) : notFound();
}
