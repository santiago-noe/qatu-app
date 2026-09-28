import { expect, test } from "bun:test";
import { Tag } from "lucide-react";
import { CATALOG_ICONS, catalogIcon } from "./catalog-icons";

// Íconos que siembra qatu-api (migrations/0004_pilot_catalog.up.sql): todos deben tener componente.
const SEEDED = [
  "HardHat", "Hammer", "Trees", "SprayCan", "PaintRoller", "Projector",
  "Wrench", "Zap", "Scissors", "Ruler", "KeyRound", "BrickWall", "Sparkles", "WashingMachine", "Sofa",
];

test("cada ícono del catálogo del piloto está registrado", () => {
  for (const name of SEEDED) expect(CATALOG_ICONS[name], name).toBeDefined();
});

test("un ícono desconocido o manipulado cae en el genérico", () => {
  expect(catalogIcon("NoExiste")).toBe(Tag);
  expect(catalogIcon(undefined)).toBe(Tag);
  expect(catalogIcon("constructor")).toBe(Tag);
  expect(catalogIcon("HardHat")).toBe(CATALOG_ICONS.HardHat);
});
