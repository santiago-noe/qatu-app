import type { NextRequest } from "next/server";
import { forwardJson } from "@/lib/bff";

// POST /api/auth/email/verify → qatu-api /auth/email/verify. Confirma el correo de la sesión con el código.
export function POST(req: NextRequest) {
  return forwardJson(req, "/auth/email/verify");
}
