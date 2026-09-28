import type { NextRequest } from "next/server";
import { forwardJson } from "@/lib/bff";

// POST /api/auth/two-factor/verify → qatu-api /auth/two-factor/verify. Confirma el segundo paso en esta sesión.
export function POST(req: NextRequest) {
  return forwardJson(req, "/auth/two-factor/verify");
}
