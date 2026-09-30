// Utilidades de ciudades y distritos del admin. Las reglas son las de qatu-api
// (internal/core/domain/catalog_places.go); aquí solo se adelantan para avisar al instante.
import type { ApiAdminZone, GeoJsonMultiPolygon } from "@/lib/api";

export const PLACE_NAME_MAX = 80;

const SLUG_SHAPE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const CITY_UBIGEO = /^\d{4}$/;
const ZONE_UBIGEO = /^\d{6}$/;

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * "-13.1631, -74.2236" → {lat, lng}. Es lo que copia Google Maps con clic derecho (latitud primero).
 * Acepta el signo menos tipográfico (−) y espacios; undefined si no son dos números en rango.
 */
export function parseLatLng(raw: string): LatLng | undefined {
  const parts = raw.replace(/−/g, "-").split(/[,;\s]+/).filter(Boolean);
  if (parts.length !== 2) return undefined;
  const [lat, lng] = parts.map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return undefined;
  return { lat, lng };
}

export function formatLatLng(p: LatLng): string {
  return `${p.lat}, ${p.lng}`;
}

export const CITY_FIELDS = ["slug", "name", "region", "ubigeo", "center"] as const;
export type CityField = (typeof CITY_FIELDS)[number];

export interface CityDraft {
  slug: string;
  name: string;
  region: string;
  ubigeo: string;
  center: string;
}

function checkName(value: string): string | undefined {
  const name = value.trim();
  if (!name) return "Escribe el nombre.";
  if (name.length > PLACE_NAME_MAX) return `Usa como máximo ${PLACE_NAME_MAX} caracteres.`;
  return undefined;
}

function checkSlug(value: string): string | undefined {
  return SLUG_SHAPE.test(value.trim()) ? undefined : "Solo minúsculas, números y guiones (ej. san-juan-bautista).";
}

function compact<K extends string>(errors: Partial<Record<K, string | undefined>>): Partial<Record<K, string>> {
  return Object.fromEntries(Object.entries(errors).filter(([, v]) => v)) as Partial<Record<K, string>>;
}

export function validateCity(d: CityDraft): Partial<Record<CityField, string>> {
  return compact<CityField>({
    slug: checkSlug(d.slug),
    name: checkName(d.name),
    region: checkName(d.region),
    ubigeo: d.ubigeo.trim() && !CITY_UBIGEO.test(d.ubigeo.trim()) ? "El ubigeo de la provincia tiene 4 dígitos." : undefined,
    center: parseLatLng(d.center) ? undefined : "Escribe latitud y longitud, por ejemplo -13.1631, -74.2236.",
  });
}

export const ZONE_FIELDS = ["slug", "name", "ubigeo", "sort_order", "boundary"] as const;
export type ZoneField = (typeof ZONE_FIELDS)[number];

export interface ZoneDraft {
  slug: string;
  name: string;
  ubigeo: string;
  sortOrder: string;
}

export function validateZone(d: ZoneDraft, cityUbigeo = ""): Partial<Record<ZoneField, string>> {
  const ubigeo = d.ubigeo.trim();
  const sort = Number(d.sortOrder);
  let ubigeoError: string | undefined;
  if (ubigeo && !ZONE_UBIGEO.test(ubigeo)) ubigeoError = "El ubigeo del distrito tiene 6 dígitos.";
  else if (ubigeo && !ubigeo.startsWith(cityUbigeo)) ubigeoError = `Debe empezar con ${cityUbigeo}, el de su provincia.`;
  return compact<ZoneField>({
    slug: checkSlug(d.slug),
    name: checkName(d.name),
    ubigeo: ubigeoError,
    sort_order:
      d.sortOrder.trim() === "" || !Number.isInteger(sort) || sort < 0 || sort > 32_767 ? "Un número entero desde 0." : undefined,
  });
}

// Códigos de qatu-api (handler/errors.go) que corresponden a un campo.
const FIELD_BY_CODE: Record<string, CityField | ZoneField> = {
  slug_invalido: "slug",
  ciudad_registrada: "slug",
  distrito_registrado: "slug",
  nombre_invalido: "name",
  ubigeo_invalido: "ubigeo",
  ubicacion_invalida: "center",
  orden_invalido: "sort_order",
  limite_invalido: "boundary",
  limite_lejano: "boundary",
  limite_superpuesto: "boundary",
};

/** Campo del formulario (entre fields) al que pertenece un error de qatu-api; undefined = aviso general. */
export function placeFieldForError<F extends string>(code: string, fields: readonly F[]): F | undefined {
  const field = Object.hasOwn(FIELD_BY_CODE, code) ? FIELD_BY_CODE[code] : undefined;
  return fields.find((f) => f === field);
}

const GEOJSON_TYPES = new Set(["Polygon", "MultiPolygon", "Feature", "FeatureCollection"]);

/**
 * Lee el archivo de límite: un GeoJSON de overpass-turbo, geojson.io o el INEI. Solo revisa que
 * sea JSON con un tipo que qatu-api entiende; qatu-api valida la geometría y que caiga en la ciudad.
 */
export function readBoundaryFile(text: string): unknown | undefined {
  try {
    const value: unknown = JSON.parse(text);
    const type = value && typeof value === "object" ? (value as { type?: unknown }).type : undefined;
    return typeof type === "string" && GEOJSON_TYPES.has(type) ? value : undefined;
  } catch {
    return undefined;
  }
}

export interface ZoneShape {
  slug: string;
  name: string;
  enabled: boolean;
  d: string;
}

export interface ZonesMap {
  viewBox: string;
  shapes: ZoneShape[];
}

const MAP_WIDTH = 1000;

/**
 * Dibuja los límites en SVG: proyección equirectangular corregida por la latitud (en un distrito
 * la distorsión no se nota). El norte arriba; undefined si ningún distrito tiene límite.
 */
export function zonesMap(zones: ApiAdminZone[]): ZonesMap | undefined {
  const withBoundary = zones.filter((z): z is ApiAdminZone & { boundary: GeoJsonMultiPolygon } => Boolean(z.boundary));
  const points = withBoundary.flatMap((z) => z.boundary.coordinates.flat(2));
  if (points.length === 0) return undefined;

  const lngs = points.map((p) => p[0]);
  const lats = points.map((p) => p[1]);
  const [west, east, south, north] = [Math.min(...lngs), Math.max(...lngs), Math.min(...lats), Math.max(...lats)];
  const kx = Math.cos((((south + north) / 2) * Math.PI) / 180);
  const spanX = Math.max((east - west) * kx, 1e-9);
  const scale = MAP_WIDTH / spanX;
  const height = Math.max(1, Math.round((north - south) * scale));
  const x = (lng: number) => ((lng - west) * kx * scale).toFixed(1);
  const y = (lat: number) => ((north - lat) * scale).toFixed(1);

  const shapes = withBoundary.map((z) => ({
    slug: z.slug,
    name: z.name,
    enabled: z.enabled,
    d: z.boundary.coordinates
      .flatMap((polygon) => polygon.map((ring) => `M${ring.map(([lng, lat]) => `${x(lng)} ${y(lat)}`).join("L")}Z`))
      .join(""),
  }));
  return { viewBox: `0 0 ${MAP_WIDTH} ${height}`, shapes };
}
