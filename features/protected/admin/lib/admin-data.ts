// Datos del panel admin para Server Components. qatu-api exige rol admin y segundo paso:
// sin el código, authedGet lleva a /auth/two-factor y vuelve a returnTo.
import type { ApiAdminCategory, ApiAdminCity, ApiAdminZone, ApiSetting, Vertical } from "@/lib/api";
import { authedGet } from "@/lib/current-user";

export async function loadCategories(vertical: Vertical, returnTo: string) {
  const { categories } = await authedGet<{ categories: ApiAdminCategory[] }>(
    `/admin/catalog/categories?vertical=${vertical}`,
    returnTo,
  );
  return categories;
}

export async function loadCities(returnTo: string) {
  const { cities } = await authedGet<{ cities: ApiAdminCity[] }>("/admin/cities", returnTo);
  return cities;
}

/** Una ciudad (también apagada) con todos sus distritos; 404 si no existe. */
export function loadCityZones(slug: string, returnTo: string) {
  return authedGet<{ city: ApiAdminCity; zones: ApiAdminZone[] }>(`/admin/cities/${encodeURIComponent(slug)}/zones`, returnTo);
}

export async function loadSettings(returnTo: string) {
  const { settings } = await authedGet<{ settings: ApiSetting[] }>("/admin/settings", returnTo);
  return settings;
}

/**
 * Para páginas sin datos propios al abrir (Usuarios): confirma con qatu-api que la sesión ya pasó
 * el segundo paso antes de mostrar el formulario, en lugar de fallar al primer uso.
 */
export async function requireAdminAccess(returnTo: string) {
  await loadCities(returnTo);
}
