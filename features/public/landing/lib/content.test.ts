import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import { LEGAL_LINKS, NAV_LINKS } from "@/lib/site";
import * as content from "./content";
import type { ApiCategory } from "@/lib/api";
import { CATEGORY_IMAGES, FAQ, HERO, TOOL_SECTION, TRADE_SECTION, toCategoryItems } from "./content";

const publicFile = (src: string) => join(process.cwd(), "public", src);

const fromApi = (slug: string, icon?: string): ApiCategory => ({ id: slug, slug, name: slug, icon, risk_level: "medium" });

describe("tarjetas de categorías (catálogo de qatu-api)", () => {
  test("las fotos declaradas existen en public/", () => {
    for (const image of [HERO.image, ...Object.values(CATEGORY_IMAGES)]) {
      expect(existsSync(publicFile(image.src)), image.src).toBe(true);
      expect(image.alt.length).toBeGreaterThan(0);
    }
  });

  test("herramientas: la foto por slug; una categoría nueva sin foto muestra su ícono", () => {
    const [construccion, nueva] = toCategoryItems([fromApi("construccion", "HardHat"), fromApi("soldadura", "Zap")], true);
    expect(construccion.image?.src).toBe("/images/categories/construccion.webp");
    expect(nueva.image).toBeUndefined();
    expect(nueva.icon).toBeDefined();
  });

  test("oficios: sin fotos aunque el slug coincida (Pintura existe en ambas verticales)", () => {
    const [pintura] = toCategoryItems([fromApi("pintura", "PaintRoller")], false);
    expect(pintura.image).toBeUndefined();
    expect(pintura.slug).toBe("pintura");
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
