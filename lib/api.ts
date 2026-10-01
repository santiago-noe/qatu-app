// Cliente server-side hacia qatu-api. El navegador nunca llama al backend directo.
const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8080";

/** Datos de la petición original que el BFF reenvía a qatu-api. */
export interface BackendContext {
  /** Token de la cookie de sesión; va como Bearer. */
  token?: string;
  /** IP real del usuario: qatu-api limita intentos por IP y la registra en la auditoría. */
  clientIp?: string;
  userAgent?: string;
  /** Token del widget de Cloudflare Turnstile (registro y recuperación). */
  turnstileToken?: string;
}

export function backendFetch(path: string, init: RequestInit = {}, ctx: BackendContext = {}) {
  const headers = new Headers(init.headers);
  if (ctx.token) headers.set("Authorization", `Bearer ${ctx.token}`);
  if (ctx.clientIp) headers.set("X-Forwarded-For", ctx.clientIp);
  if (ctx.userAgent) headers.set("User-Agent", ctx.userAgent);
  if (ctx.turnstileToken) headers.set("X-Turnstile-Token", ctx.turnstileToken);
  return fetch(`${API_BASE_URL}/api/v1${path}`, { ...init, headers, cache: "no-store" });
}

/** GET a qatu-api desde el servidor que falla si la respuesta no es 2xx (datos públicos de páginas). */
export async function backendJSON<T>(path: string, ctx: BackendContext = {}): Promise<T> {
  const res = await backendFetch(path, {}, ctx);
  if (!res.ok) throw new Error(`qatu-api GET ${path} respondió ${res.status}`);
  return res.json() as Promise<T>;
}

/** Error público de qatu-api: {"error": "codigo", "message": "texto"}. */
export interface ApiError {
  error: string;
  message: string;
}

/** Vista pública del usuario (GET /me y respuestas de acceso). */
export interface ApiUser {
  id: string;
  email?: string;
  email_verified: boolean;
  name: string;
  avatar_url?: string;
  roles: string[];
  status: "active" | "suspended";
  verification_level: number;
  can_transact: boolean;
}

/** Respuesta de POST /auth/register y /auth/login. */
export interface ApiAuthResponse {
  session: { token: string; expires_at: string };
  user: ApiUser;
  two_factor_required: boolean;
  verification_sent?: boolean;
}

/** Ciudad habilitada (GET /cities). */
export interface ApiCity {
  slug: string;
  name: string;
  region: string;
  timezone: string;
  center: { lat: number; lng: number };
}

/** Distrito de una ciudad (GET /cities/{slug}/zones). */
export interface ApiZone {
  id: string;
  slug: string;
  name: string;
  ubigeo?: string;
  /** Tiene límite: se puede detectar por la ubicación del navegador. */
  detectable: boolean;
}

/** Ciudad y distrito (GET /geo/zone y /me/location). */
export interface ApiLocation {
  city: ApiCity;
  zone: ApiZone;
}

/** Categoría u oficio del catálogo público (GET /catalog/categories). */
export interface ApiCategory {
  id: string;
  slug: string;
  name: string;
  description?: string;
  /** Nombre de un ícono de lucide-react (lib/catalog-icons.ts lo traduce). */
  icon?: string;
  risk_level: "low" | "medium" | "high";
  attributes_schema?: unknown;
  children?: ApiCategory[];
}

export type RiskLevel = ApiCategory["risk_level"];
export type Vertical = "rental" | "service";

/** Categoría vista por el admin (GET /admin/catalog/categories): incluye lo apagado y lo prohibido. */
export interface ApiAdminCategory {
  id: string;
  vertical: Vertical;
  parent_id?: string;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  sort_order: number;
  attributes_schema: unknown;
  risk_level: RiskLevel;
  prohibited: boolean;
  enabled: boolean;
  children?: ApiAdminCategory[];
}

/** Ciudad vista por el admin (GET /admin/cities): incluye las apagadas. */
export interface ApiAdminCity {
  id: string;
  slug: string;
  name: string;
  region: string;
  /** Ubigeo INEI de la provincia (4 dígitos). */
  ubigeo?: string;
  center: { lat: number; lng: number };
  enabled: boolean;
}

/** Límite de un distrito en GeoJSON (qatu-api lo guarda como MultiPolygon, longitud y latitud). */
export interface GeoJsonMultiPolygon {
  type: "MultiPolygon";
  coordinates: number[][][][];
}

/** Distrito visto por el admin (GET /admin/cities/{slug}/zones): con su límite simplificado. */
export interface ApiAdminZone {
  id: string;
  slug: string;
  name: string;
  ubigeo?: string;
  sort_order: number;
  enabled: boolean;
  has_boundary: boolean;
  boundary?: GeoJsonMultiPolygon;
}

/** Cómo está una categoría en una ciudad (GET /admin/catalog/categories/{id}/cities). */
export interface ApiCategoryCity {
  city: string;
  name: string;
  city_enabled: boolean;
  /** null: sigue el valor global de la categoría. */
  override: boolean | null;
  /** Si se ofrece en la ciudad (una prohibida nunca). */
  active: boolean;
}

/** Valor de platform_settings en su alcance (sin ciudad ni categoría = global). */
export interface ApiSetting {
  id: string;
  key: string;
  city_id?: string;
  category_id?: string;
  /** Comisiones en puntos básicos: 1000 = 10 %. */
  value: number;
  description?: string;
  updated_by?: string;
  updated_at: string;
  version: number;
}

/** Cambio de un ajuste (GET /admin/settings/{key}/history). before es null al crearlo. */
export interface ApiSettingChange {
  at: string;
  actor_id?: string;
  before: { value: number; city?: string; category_id?: string } | null;
  after: { value: number; city?: string; category_id?: string };
}

/** Usuario visto por el admin: además, el motivo de suspensión. */
export interface ApiAdminUser extends ApiUser {
  suspended_reason?: string;
}

/** Lugar resuelto (ciudad o distrito) dentro de otra respuesta. */
export interface ApiPlaceRef {
  id: string;
  slug: string;
  name: string;
}

/** Perfil de arrendador (GET/PUT /me/lender). El celular solo lo ve su dueño. */
export interface ApiLender {
  kind: "person" | "business";
  business_name?: string;
  phone: string;
  city: ApiPlaceRef;
  zone: ApiPlaceRef;
}

export type ListingStatus = "draft" | "in_review" | "published" | "paused" | "rejected" | "archived";

/** Precios en céntimos; 0 = esa modalidad no se ofrece. */
export interface ApiPrices {
  hour: number;
  day: number;
  weekend: number;
  week: number;
  month: number;
}

/** Formulario del asistente de publicación (lo que el arrendador edita). Montos en céntimos. */
export interface ApiListingFields {
  category_id: string;
  title: string;
  description: string;
  attributes: Record<string, unknown>;
  replacement_value: number;
  deposit: number;
  prices: ApiPrices;
  accessories: string[];
  usage_instructions: string;
  pickup_enabled: boolean;
  pickup_location: { lat: number; lng: number } | null;
  delivery_enabled: boolean;
  delivery_fee: number;
  delivery_zone_ids: string[];
  booking_mode: "request" | "instant";
  cancel_policy: "flexible" | "moderate" | "strict";
  min_verification: number;
  min_notice_hours: number;
  min_duration_hours: number;
  max_duration_hours: number;
}

/** Publicación del arrendador (GET /me/listings/{id}): incluye el punto exacto, solo para él. */
export interface ApiListing extends ApiListingFields {
  id: string;
  city_id: string;
  zone_id?: string;
  public_location: { lat: number; lng: number } | null;
  public_radius_m?: number;
  status: ListingStatus;
  rejection_reason?: string;
  first_published_at?: string;
  version: number;
  created_at: string;
  updated_at: string;
}

/** Garantía sugerida y su rango, en céntimos (GET /me/lender/deposit-suggestion). */
export interface ApiDepositSuggestion {
  suggested: number;
  min: number;
  max: number;
}

/** Foto de una publicación (GET /me/listings/{id}/photos). urls por ancho: "320", "800", "1600". */
export interface ApiPhoto {
  id: string;
  kind: "public" | "serial";
  status: "pending" | "ready" | "failed";
  width?: number;
  height?: number;
  sort_order: number;
  urls: Record<string, string>;
}

/** Subida directa al almacenamiento (POST /me/listings/{id}/photos). */
export interface ApiPhotoUpload {
  photo: ApiPhoto;
  upload: { method: "PUT"; url: string; headers: Record<string, string>; expires_at: string };
}

/** Bloqueo del calendario (GET /me/listings/{id}/availability). end no se incluye. */
export interface ApiBlock {
  id: string;
  start: string;
  end: string;
  reason: "manual" | "booking" | "hold";
  note?: string;
}

/** Publicación en la cola de moderación (GET /moderation/listings): sin punto exacto ni placa. */
export interface ApiReviewItem {
  listing: ApiListing;
  owner: { name: string; first_listing: boolean };
  category: { id: string; name: string; risk_level: RiskLevel; attributes_schema?: unknown };
  photos: ApiPhoto[];
}
