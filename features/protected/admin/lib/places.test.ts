import { expect, test } from "bun:test";
import type { ApiAdminZone } from "@/lib/api";
import { CITY_FIELDS, parseLatLng, placeFieldForError, ZONE_FIELDS, readBoundaryFile, validateCity, validateZone, zonesMap } from "./places";

test("parseLatLng acepta lo que copia Google Maps", () => {
  expect(parseLatLng("-13.1631, -74.2236")).toEqual({ lat: -13.1631, lng: -74.2236 });
  expect(parseLatLng("−13.1631 −74.2236")).toEqual({ lat: -13.1631, lng: -74.2236 });
  for (const raw of ["", "-13.16", "a, b", "-95, -74", "-13, -190", "1, 2, 3"]) {
    expect(parseLatLng(raw), raw).toBeUndefined();
  }
});

test("validateCity", () => {
  const ok = { slug: "cusco", name: "Cusco", region: "Cusco", ubigeo: "0801", center: "-13.5167, -71.9781" };
  expect(validateCity(ok)).toEqual({});
  expect(validateCity({ ...ok, ubigeo: "" })).toEqual({});
  expect(Object.keys(validateCity({ slug: "Cusco", name: "", region: " ", ubigeo: "080108", center: "cusco" })).sort()).toEqual([
    "center",
    "name",
    "region",
    "slug",
    "ubigeo",
  ]);
});

test("validateZone: el ubigeo empieza con el de la provincia", () => {
  const ok = { slug: "carmen-alto", name: "Carmen Alto", ubigeo: "050104", sortOrder: "3" };
  expect(validateZone(ok, "0501")).toEqual({});
  expect(validateZone({ ...ok, ubigeo: "080108" }, "0501").ubigeo).toContain("0501");
  expect(validateZone({ ...ok, ubigeo: "0501" }, "0501").ubigeo).toContain("6 dígitos");
  expect(validateZone({ ...ok, sortOrder: "-1" }).sort_order).toBeDefined();
});

test("placeFieldForError lleva el error a su campo", () => {
  expect(placeFieldForError("limite_superpuesto", ZONE_FIELDS)).toBe("boundary");
  expect(placeFieldForError("limite_superpuesto", CITY_FIELDS)).toBeUndefined(); // la ciudad no tiene límite
  expect(placeFieldForError("ciudad_registrada", CITY_FIELDS)).toBe("slug");
  expect(placeFieldForError("ciudad_sin_distritos", CITY_FIELDS)).toBeUndefined();
  expect(placeFieldForError("toString", ZONE_FIELDS)).toBeUndefined();
});

test("readBoundaryFile acepta GeoJSON de polígonos", () => {
  expect(readBoundaryFile('{"type":"FeatureCollection","features":[]}')).toBeDefined();
  expect(readBoundaryFile('{"type":"Polygon","coordinates":[]}')).toBeDefined();
  for (const raw of ["", "{", '{"type":"Point"}', "[]", "null"]) {
    expect(readBoundaryFile(raw), raw).toBeUndefined();
  }
});

const zone = (slug: string, coordinates?: number[][][][]): ApiAdminZone => ({
  id: slug,
  slug,
  name: slug,
  sort_order: 0,
  enabled: true,
  has_boundary: Boolean(coordinates),
  boundary: coordinates && { type: "MultiPolygon", coordinates },
});

test("zonesMap proyecta con el norte arriba", () => {
  const square = [[[[-74.2, -13.2], [-74.1, -13.2], [-74.1, -13.1], [-74.2, -13.1], [-74.2, -13.2]]]];
  const map = zonesMap([zone("a", square), zone("sin-limite")]);
  expect(map?.shapes).toHaveLength(1);
  expect(map?.viewBox.startsWith("0 0 1000 ")).toBe(true);
  // El vértice del suroeste queda abajo a la izquierda; el del noreste, arriba a la derecha.
  const height = Number(map!.viewBox.split(" ")[3]);
  const [x0, y0] = map!.shapes[0].d.slice(1).split("L")[0].split(" ").map(Number);
  expect(x0).toBe(0);
  expect(Math.abs(y0 - height)).toBeLessThan(1);
  expect(map!.shapes[0].d).toContain("L1000.0 0.0");
  expect(zonesMap([zone("sin-limite")])).toBeUndefined();
});
