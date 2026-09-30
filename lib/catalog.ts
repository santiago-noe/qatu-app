// Catálogo público para Server Components (landing, búsqueda): lo que el admin encienda o apague
// en qatu-api se ve en la siguiente visita. El API responde desde Redis.
import { backendJSON, type ApiCategory, type ApiCity, type ApiZone } from "./api";

export interface PublicCatalog {
  city: ApiCity | null;
  zones: ApiZone[];
  tools: ApiCategory[];
  trades: ApiCategory[];
}

const EMPTY: PublicCatalog = { city: null, zones: [], tools: [], trades: [] };

/**
 * Catálogo de la ciudad del piloto (la primera habilitada). Si qatu-api no responde, devuelve
 * listas vacías: la página sigue en pie sin esas secciones en lugar de mostrar un error.
 */
export async function loadPublicCatalog(): Promise<PublicCatalog> {
  try {
    const { cities } = await backendJSON<{ cities: ApiCity[] }>("/cities");
    const city = cities[0];
    if (!city) return EMPTY;
    const slug = encodeURIComponent(city.slug);
    const [zones, tools, trades] = await Promise.all([
      backendJSON<{ zones: ApiZone[] }>(`/cities/${slug}/zones`),
      backendJSON<{ categories: ApiCategory[] }>(`/catalog/categories?vertical=rental&city=${slug}`),
      backendJSON<{ categories: ApiCategory[] }>(`/catalog/categories?vertical=service&city=${slug}`),
    ]);
    return { city, zones: zones.zones, tools: tools.categories, trades: trades.categories };
  } catch {
    return EMPTY;
  }
}

/** Una ciudad habilitada con sus distritos (para elegir distrito en formularios). */
export interface CityZones {
  city: ApiCity;
  zones: ApiZone[];
}

/** Ciudades habilitadas con sus distritos activos. */
export async function loadCitiesWithZones(): Promise<CityZones[]> {
  const { cities } = await backendJSON<{ cities: ApiCity[] }>("/cities");
  return Promise.all(
    cities.map(async (city) => ({
      city,
      zones: (await backendJSON<{ zones: ApiZone[] }>(`/cities/${encodeURIComponent(city.slug)}/zones`)).zones,
    })),
  );
}

/** Tipos de herramienta publicables en la ciudad (cada uno con el esquema de atributos efectivo). */
export async function loadRentalCategories(citySlug: string): Promise<ApiCategory[]> {
  const { categories } = await backendJSON<{ categories: ApiCategory[] }>(
    `/catalog/categories?vertical=rental&city=${encodeURIComponent(citySlug)}`,
  );
  return categories;
}

/** Nombre visible de un slug (distrito o categoría); undefined si no existe. */
export function nameOf(list: { slug: string; name: string }[], slug: string | undefined): string | undefined {
  return slug ? list.find((item) => item.slug === slug)?.name : undefined;
}
