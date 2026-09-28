import type { NextRequest } from "next/server";
import { errorResponse, forwardGet } from "@/lib/bff";

// GET /api/geo/zone?lat=&lng= → distrito del punto (qatu-api /geo/zone). Solo se reenvían lat y
// lng como números: nada más de la URL llega al API. El punto no se guarda en ningún lado.
export function GET(req: NextRequest) {
  const lat = Number(req.nextUrl.searchParams.get("lat"));
  const lng = Number(req.nextUrl.searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return errorResponse(400, "ubicacion_invalida", "La ubicación no es válida.");
  }
  return forwardGet(req, `/geo/zone?${new URLSearchParams({ lat: String(lat), lng: String(lng) })}`);
}
