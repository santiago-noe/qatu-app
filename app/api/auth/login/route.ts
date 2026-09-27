import type { NextRequest } from "next/server";
import { forwardJson } from "@/lib/bff";

// POST /api/auth/login → qatu-api /auth/login; deja la sesión en la cookie.
export function POST(req: NextRequest) {
  return forwardJson(req, "/auth/login", { startsSession: true });
}
