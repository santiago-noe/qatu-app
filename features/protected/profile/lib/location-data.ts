// Datos de la tarjeta "Tu distrito" para Server Components (usa la sesión de la cookie).
import { backendJSON, type ApiCity, type ApiLocation, type ApiZone } from "@/lib/api";
import { authedGet } from "@/lib/current-user";
import type { CityZones } from "@/features/protected/profile/components/location-card";

export async function loadLocationCard(): Promise<{ cities: CityZones[]; current: ApiLocation | null }> {
  const [{ location }, { cities }] = await Promise.all([
    authedGet<{ location: ApiLocation | null }>("/me/location"),
    backendJSON<{ cities: ApiCity[] }>("/cities"),
  ]);
  const withZones = await Promise.all(
    cities.map(async (city) => ({
      city,
      zones: (await backendJSON<{ zones: ApiZone[] }>(`/cities/${encodeURIComponent(city.slug)}/zones`)).zones,
    })),
  );
  return { cities: withZones, current: location };
}
