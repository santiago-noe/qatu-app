import type { NextRequest } from "next/server";
import { forwardJson } from "@/lib/bff";

// PUT /api/me/location {city, zone} → guarda la ciudad y el distrito del usuario (requiere sesión).
export function PUT(req: NextRequest) {
  return forwardJson(req, "/me/location", { method: "PUT" });
}
