// Utilidades del editor de categorías y oficios. Los límites son los de qatu-api
// (internal/core/domain/catalog_admin.go y la migración 0003).
import type { ApiAdminCategory, RiskLevel, Vertical } from "@/lib/api";

export const CATEGORY_NAME_MAX = 80;
export const CATEGORY_DESCRIPTION_MAX = 280;
export const SORT_ORDER_MAX = 32_767;

export const RISK_LABELS: Record<RiskLevel, string> = { low: "Bajo", medium: "Medio", high: "Alto" };

export const VERTICAL_TEXT: Record<Vertical, { title: string; child: string; newRoot: string }> = {
  rental: { title: "Categorías de herramientas", child: "tipo", newRoot: "Nueva categoría" },
  service: { title: "Oficios", child: "especialidad", newRoot: "Nuevo oficio" },
};

const SLUG_SHAPE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** "Construcción Pesada" → "construccion-pesada" (el identificador que va en las URL). */
export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface CategoryDraft {
  name: string;
  slug: string;
  description: string;
  sortOrder: string;
  schema: string;
}

export type CategoryField = "name" | "slug" | "description" | "sort_order" | "attributes_schema" | "parent_id";

// Códigos de qatu-api (handler/errors.go) que corresponden a un campo del editor.
const FIELD_BY_CODE: Record<string, CategoryField> = {
  nombre_invalido: "name",
  slug_invalido: "slug",
  slug_registrado: "slug",
  descripcion_invalida: "description",
  orden_invalido: "sort_order",
  esquema_invalido: "attributes_schema",
  arbol_invalido: "parent_id",
};

/** Campo del editor al que pertenece un error de qatu-api; undefined = aviso general. */
export function categoryFieldForError(code: string): CategoryField | undefined {
  return Object.hasOwn(FIELD_BY_CODE, code) ? FIELD_BY_CODE[code] : undefined;
}

/** Validación inmediata en el navegador; qatu-api vuelve a validar todo (y el JSON Schema completo). */
export function validateCategory(d: CategoryDraft): Partial<Record<CategoryField, string>> {
  const name = d.name.trim();
  const sort = Number(d.sortOrder);
  const errors: Partial<Record<CategoryField, string>> = {};
  if (!name) errors.name = "Escribe el nombre.";
  else if (name.length > CATEGORY_NAME_MAX) errors.name = `Usa como máximo ${CATEGORY_NAME_MAX} caracteres.`;
  if (!SLUG_SHAPE.test(d.slug.trim())) errors.slug = "Solo minúsculas, números y guiones (ej. rotomartillo).";
  if (d.description.trim().length > CATEGORY_DESCRIPTION_MAX)
    errors.description = `Usa como máximo ${CATEGORY_DESCRIPTION_MAX} caracteres.`;
  if (d.sortOrder.trim() === "" || !Number.isInteger(sort) || sort < 0 || sort > SORT_ORDER_MAX)
    errors.sort_order = "Un número entero desde 0.";
  if (parseSchema(d.schema) === undefined) errors.attributes_schema = "No es un JSON válido de tipo objeto.";
  return errors;
}

/** El esquema escrito, si es un objeto JSON; undefined si no. */
export function parseSchema(raw: string): Record<string, unknown> | undefined {
  try {
    const value: unknown = JSON.parse(raw);
    return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined;
  } catch {
    return undefined;
  }
}

/** Padres posibles: solo raíces (el catálogo tiene 2 niveles) y nunca la propia categoría. */
export function parentOptions(roots: ApiAdminCategory[], selfId?: string) {
  return roots.filter((r) => r.id !== selfId).map((r) => ({ value: r.id, label: r.name }));
}

/** Árbol aplanado (raíz y luego sus hijos), para listas de selección. */
export function flattenTree(roots: ApiAdminCategory[]): { category: ApiAdminCategory; depth: 0 | 1 }[] {
  return roots.flatMap((root) => [
    { category: root, depth: 0 as const },
    ...(root.children ?? []).map((child) => ({ category: child, depth: 1 as const })),
  ]);
}
