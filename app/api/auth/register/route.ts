import type { NextRequest } from "next/server";
import { forwardJson } from "@/lib/bff";

// POST /api/auth/register → qatu-api /auth/register; deja la sesión en la cookie.
export function POST(req: NextRequest) {
  return forwardJson(req, "/auth/register", { startsSession: true });
}
