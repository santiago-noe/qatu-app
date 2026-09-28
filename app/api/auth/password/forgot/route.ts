import type { NextRequest } from "next/server";
import { forwardJson } from "@/lib/bff";

// POST /api/auth/password/forgot → qatu-api /auth/password/forgot. Envía el código de recuperación (siempre 202: no revela si el correo existe).
export function POST(req: NextRequest) {
  return forwardJson(req, "/auth/password/forgot");
}
