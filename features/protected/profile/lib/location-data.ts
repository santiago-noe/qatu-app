// Datos de la tarjeta "Tu distrito" para Server Components (usa la sesión de la cookie).
import type { ApiLocation } from "@/lib/api";
import { type CityZones, loadCitiesWithZones } from "@/lib/catalog";
import { authedGet } from "@/lib/current-user";

export async function loadLocationCard(): Promise<{ cities: CityZones[]; current: ApiLocation | null }> {
  const [{ location }, cities] = await Promise.all([
    authedGet<{ location: ApiLocation | null }>("/me/location"),
    loadCitiesWithZones(),
  ]);
  return { cities, current: location };
}
