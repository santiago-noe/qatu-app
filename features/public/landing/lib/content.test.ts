import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import { LEGAL_LINKS, NAV_LINKS } from "@/lib/site";
import * as content from "./content";
import { FAQ, HERO, TOOL_SECTION, TRADE_SECTION } from "./content";
import { toSlug } from "./search";

const SECTIONS = [TOOL_SECTION, TRADE_SECTION];
const publicFile = (src: string) => join(process.cwd(), "public", src);

describe("secciones de categorías", () => {
  test.each(SECTIONS.map((s) => [s.id, s] as const))("%s: slugs únicos", (_, section) => {
    const slugs = section.items.map((i) => toSlug(i.name));
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test.each(SECTIONS.map((s) => [s.id, s] as const))("%s: cada tarjeta tiene foto o ícono", (_, section) => {
    for (const item of section.items) expect(Boolean(item.image || item.icon)).toBe(true);
  });

  test("las fotos declaradas existen en public/", () => {
    const images = [HERO.image, ...SECTIONS.flatMap((s) => s.items.flatMap((i) => (i.image ? [i.image] : [])))];
    for (const image of images) {
      expect(existsSync(publicFile(image.src)), image.src).toBe(true);
      expect(image.alt.length).toBeGreaterThan(0);
    }
  });
});

describe("reglas de contenido (spec 000: nada inventado)", () => {
  // Texto de todo el contenido de la landing, serializado.
  const text = JSON.stringify(content, (_, v) => (typeof v === "function" ? undefined : v)).toLowerCase();

  test.each([
    ["cifras de usuarios", /\+\s?\d{2,}/],
    ["calificaciones", /\d[.,]\d\s?\/\s?5/],
    ["precios en soles", /s\/\s?\d/],
    ["mejor precio", /mejor precio/],
    ["seguridad garantizada", /garantizad[oa]/],
    ["ofertas o descuentos", /\bdescuento|\bofertas?\b/],
  ])("sin %s", (_, pattern) => {
    expect(text).not.toMatch(pattern);
  });

  test("no promete compra ni IA en el piloto", () => {
    expect(text).not.toMatch(/\bcompra\b|carrito|inteligencia artificial|recomendaciones inteligentes/);
  });

  test("hay preguntas frecuentes con respuesta", () => {
    expect(FAQ.length).toBeGreaterThan(0);
    for (const f of FAQ) expect(f.answer.trim().length).toBeGreaterThan(0);
  });
});

describe("navegación del sitio", () => {
  test("los enlaces de la cabecera apuntan a secciones de la landing", () => {
    const anchors = NAV_LINKS.map((l) => l.href.replace("/#", ""));
    expect(anchors).toContain(TOOL_SECTION.id);
    expect(anchors).toContain(TRADE_SECTION.id);
  });

  test("el Libro de Reclamaciones está en los enlaces legales (INDECOPI)", () => {
    expect(LEGAL_LINKS.map((l) => l.href)).toContain("/libro-de-reclamaciones");
  });
});
