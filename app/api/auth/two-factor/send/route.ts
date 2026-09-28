import type { NextRequest } from "next/server";
import { forwardJson } from "@/lib/bff";

// POST /api/auth/two-factor/send → qatu-api /auth/two-factor/send. Envía el código del segundo paso (roles internos).
export function POST(req: NextRequest) {
  return forwardJson(req, "/auth/two-factor/send");
}
