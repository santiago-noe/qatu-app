import { describe, expect, test } from "bun:test";
import type { ApiAdminCategory } from "@/lib/api";
import {
  categoryFieldForError,
  filterTree,
  flattenTree,
  parentOptions,
  parseSchema,
  slugify,
  validateCategory,
} from "./categories";

const cat = (id: string, children?: ApiAdminCategory[]): ApiAdminCategory => ({
  id,
  vertical: "rental",
  slug: id,
  name: id.toUpperCase(),
  sort_order: 0,
  attributes_schema: {},
  risk_level: "medium",
  prohibited: false,
  enabled: true,
  children,
});

test("slugify quita tildes, espacios y símbolos", () => {
  expect(slugify("Construcción Pesada")).toBe("construccion-pesada");
  expect(slugify("  Gasfitería & Agua  ")).toBe("gasfiteria-agua");
  expect(slugify("Ñuñu 2000")).toBe("nunu-2000");
});

describe("validateCategory", () => {
  const ok = { name: "Rotomartillo", slug: "rotomartillo", description: "", sortOrder: "0", schema: '{"type":"object"}' };

  test("acepta una categoría válida", () => {
    expect(validateCategory(ok)).toEqual({});
  });

  test("marca cada campo inválido", () => {
    const errors = validateCategory({ name: " ", slug: "Con Espacios", description: "x".repeat(281), sortOrder: "-1", schema: "[]" });
    expect(Object.keys(errors).sort()).toEqual(["attributes_schema", "description", "name", "slug", "sort_order"]);
  });

  test("el orden no puede quedar vacío", () => {
    expect(validateCategory({ ...ok, sortOrder: " " }).sort_order).toBeString();
  });
});

test("parseSchema solo acepta objetos JSON", () => {
  expect(parseSchema('{"type":"object"}')).toEqual({ type: "object" });
  expect(parseSchema("[]")).toBeUndefined();
  expect(parseSchema("null")).toBeUndefined();
  expect(parseSchema("{no")).toBeUndefined();
});

test("un padre es una raíz distinta de la categoría", () => {
  const roots = [cat("a", [cat("a1")]), cat("b")];
  expect(parentOptions(roots, "a").map((o) => o.value)).toEqual(["b"]);
  expect(flattenTree(roots).map((r) => `${r.depth}:${r.category.id}`)).toEqual(["0:a", "1:a1", "0:b"]);
});

test("los errores de qatu-api van a su campo", () => {
  expect(categoryFieldForError("slug_registrado")).toBe("slug");
  expect(categoryFieldForError("arbol_invalido")).toBe("parent_id");
  expect(categoryFieldForError("sin_permiso")).toBeUndefined();
  expect(categoryFieldForError("__proto__")).toBeUndefined();
});

test("filterTree deja la raíz como contexto de sus tipos", () => {
  const off = (c: ApiAdminCategory) => ({ ...c, enabled: false });
  const roots = [cat("a", [off(cat("a1")), cat("a2")]), off(cat("b")), cat("c")];
  expect(filterTree(roots, "all")).toBe(roots);
  expect(filterTree(roots, "off").map((r) => `${r.id}:${r.children?.map((c) => c.id).join()}`)).toEqual(["a:a1", "b:"]);
  expect(filterTree(roots, "prohibited")).toEqual([]);
});
