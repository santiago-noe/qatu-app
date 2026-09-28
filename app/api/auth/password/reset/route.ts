import type { NextRequest } from "next/server";
import { forwardJson } from "@/lib/bff";

// POST /api/auth/password/reset → qatu-api /auth/password/reset. Cambia la contraseña con el código y cierra todas las sesiones.
export function POST(req: NextRequest) {
  return forwardJson(req, "/auth/password/reset");
}
