// Formulario dinámico de atributos: la categoría trae un JSON Schema (el de su raíz más el propio)
// y aquí se convierte en campos. Se entiende lo que usa el catálogo (texto, entero, número, sí/no
// y lista cerrada); qatu-api valida el esquema completo al enviar a publicar.

export type AttributeKind = "text" | "integer" | "number" | "boolean" | "select";

export interface AttributeField {
  name: string;
  label: string;
  kind: AttributeKind;
  required: boolean;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  maxLength?: number;
}

// Etiquetas de valores cerrados conocidos (el esquema guarda el valor técnico).
const OPTION_LABELS: Record<string, string> = {
  electric: "Eléctrica",
  battery: "A batería",
  fuel: "A combustible",
  manual: "Manual",
};

interface PropertySchema {
  type?: string;
  title?: string;
  enum?: unknown[];
  minimum?: number;
  maximum?: number;
  maxLength?: number;
}

function humanize(name: string): string {
  const text = name.replace(/[_-]+/g, " ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Campos del formulario, en el orden del esquema. Un esquema raro no rompe: se ignora. */
export function attributeFields(schema: unknown): AttributeField[] {
  if (!schema || typeof schema !== "object") return [];
  const { properties, required } = schema as { properties?: Record<string, PropertySchema>; required?: unknown };
  if (!properties || typeof properties !== "object") return [];
  const requiredNames = new Set(Array.isArray(required) ? required.map(String) : []);

  return Object.entries(properties).flatMap(([name, prop]): AttributeField[] => {
    if (!prop || typeof prop !== "object") return [];
    const base = { name, label: prop.title ?? humanize(name), required: requiredNames.has(name) };
    if (Array.isArray(prop.enum)) {
      const options = prop.enum.map((v) => ({ value: String(v), label: OPTION_LABELS[String(v)] ?? String(v) }));
      return [{ ...base, kind: "select", options }];
    }
    switch (prop.type) {
      case "string":
        return [{ ...base, kind: "text", maxLength: prop.maxLength }];
      case "integer":
      case "number":
        return [{ ...base, kind: prop.type, min: prop.minimum, max: prop.maximum }];
      case "boolean":
        return [{ ...base, kind: "boolean" }];
      default:
        return [];
    }
  });
}

/** Valor guardado → texto del campo. */
export function attributeInput(value: unknown): string {
  if (value === undefined || value === null) return "";
  return String(value);
}

/**
 * Lee lo escrito y arma el objeto de atributos con sus tipos. Los vacíos no se envían (en un
 * borrador pueden faltar). Devuelve los errores por campo para mostrarlos al instante.
 */
export function readAttributes(
  fields: AttributeField[],
  get: (name: string) => string | boolean,
  { requireAll }: { requireAll: boolean },
): { values: Record<string, unknown>; errors: Record<string, string> } {
  const values: Record<string, unknown> = {};
  const errors: Record<string, string> = {};
  for (const f of fields) {
    const raw = get(f.name);
    if (f.kind === "boolean") {
      values[f.name] = raw === true;
      continue;
    }
    const text = String(raw ?? "").trim();
    if (!text) {
      if (f.required && requireAll) errors[f.name] = "Completa este dato.";
      continue;
    }
    if (f.kind === "integer" || f.kind === "number") {
      const n = Number(text.replace(",", "."));
      if (!Number.isFinite(n) || (f.kind === "integer" && !Number.isInteger(n))) {
        errors[f.name] = f.kind === "integer" ? "Escribe un número entero." : "Escribe un número.";
        continue;
      }
      if ((f.min !== undefined && n < f.min) || (f.max !== undefined && n > f.max)) {
        errors[f.name] = `Entre ${f.min ?? "…"} y ${f.max ?? "…"}.`;
        continue;
      }
      values[f.name] = n;
      continue;
    }
    if (f.maxLength !== undefined && text.length > f.maxLength) {
      errors[f.name] = `Como máximo ${f.maxLength} caracteres.`;
      continue;
    }
    values[f.name] = text;
  }
  return { values, errors };
}
