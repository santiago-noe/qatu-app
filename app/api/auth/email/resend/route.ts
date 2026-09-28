import type { NextRequest } from "next/server";
import { forwardJson } from "@/lib/bff";

// POST /api/auth/email/resend → qatu-api /auth/email/resend. Envía otro código al correo de la sesión.
export function POST(req: NextRequest) {
  return forwardJson(req, "/auth/email/resend");
}
