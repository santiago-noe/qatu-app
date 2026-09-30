import type { NextRequest } from "next/server";
import { errorResponse, forwardGet, forwardJson } from "@/lib/bff";

// /api/me/{lender,listings}/* → qatu-api /me/* (feature 003): perfil de arrendador, publicaciones,
// fotos y calendario del usuario de la sesión. qatu-api revisa sesión y dueño en cada ruta; aquí
// solo se reenvía lo de esas dos secciones. Los cambios exigen cuerpo JSON (también DELETE y los
// POST sin datos envían {}): otro sitio no puede mandarlos sin permiso CORS.
const SECTIONS = new Set(["lender", "listings"]);

async function mePath(req: NextRequest, ctx: RouteContext<"/api/me/[...path]">) {
  const { path } = await ctx.params;
  if (!SECTIONS.has(path[0]) || path.some((s) => s === "." || s === ".." || s === "")) return null;
  return `/me/${path.map(encodeURIComponent).join("/")}${req.nextUrl.search}`;
}

const notFound = () => errorResponse(404, "no_encontrado", "No existe.");

export async function GET(req: NextRequest, ctx: RouteContext<"/api/me/[...path]">) {
  const path = await mePath(req, ctx);
  return path ? forwardGet(req, path) : notFound();
}

async function forward(req: NextRequest, ctx: RouteContext<"/api/me/[...path]">, method: "POST" | "PUT" | "DELETE") {
  const path = await mePath(req, ctx);
  return path ? forwardJson(req, path, { method }) : notFound();
}

export const POST = (req: NextRequest, ctx: RouteContext<"/api/me/[...path]">) => forward(req, ctx, "POST");
export const PUT = (req: NextRequest, ctx: RouteContext<"/api/me/[...path]">) => forward(req, ctx, "PUT");
export const DELETE = (req: NextRequest, ctx: RouteContext<"/api/me/[...path]">) => forward(req, ctx, "DELETE");
