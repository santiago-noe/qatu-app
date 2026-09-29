// Cifras del Resumen del panel admin. Todas salen de qatu-api (design.md: nada inventado).
import type { ApiAdminCategory, ApiAdminCity, ApiSetting } from "@/lib/api";
import { flattenTree } from "./categories";

export interface VerticalSummary {
  roots: number;
  rootsOff: number;
  children: number;
  highRisk: number;
}

export interface Attention {
  label: string;
  detail: string;
  href: string;
}

function summarizeVertical(roots: ApiAdminCategory[]): VerticalSummary {
  const all = flattenTree(roots);
  return {
    roots: roots.length,
    rootsOff: roots.filter((r) => !r.enabled).length,
    children: all.filter((f) => f.depth === 1).length,
    highRisk: all.filter((f) => f.category.risk_level === "high").length,
  };
}

/** Lo que conviene revisar: prohibidas, apagadas y ciudades apagadas (hasta `limit`). */
function attention(rental: ApiAdminCategory[], service: ApiAdminCategory[], cities: ApiAdminCity[], limit: number) {
  const items: Attention[] = [];
  const add = (roots: ApiAdminCategory[], href: string) => {
    for (const { category } of flattenTree(roots)) {
      if (category.prohibited) items.push({ label: category.name, detail: "Prohibida", href });
      else if (!category.enabled) items.push({ label: category.name, detail: "Apagada", href });
    }
  };
  for (const city of cities) {
    if (!city.enabled) items.push({ label: city.name, detail: "Ciudad apagada", href: "/admin/ciudades" });
  }
  add(rental, "/admin/categorias");
  add(service, "/admin/oficios");
  return { items: items.slice(0, limit), more: Math.max(0, items.length - limit) };
}

export function summarize(
  rental: ApiAdminCategory[],
  service: ApiAdminCategory[],
  cities: ApiAdminCity[],
  settings: ApiSetting[],
  attentionLimit = 6,
) {
  const general = settings.filter((s) => !s.city_id && !s.category_id);
  const lastChange = settings.map((s) => s.updated_at).sort().at(-1);
  return {
    rental: summarizeVertical(rental),
    service: summarizeVertical(service),
    cities: { total: cities.length, on: cities.filter((c) => c.enabled).length },
    commissions: general,
    lastChange,
    attention: attention(rental, service, cities, attentionLimit),
  };
}

/** Saludo según la hora de Perú (el servidor puede estar en otra zona horaria). */
export function greeting(now: Date = new Date()): string {
  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: "America/Lima" }).format(now));
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}
