import { expect, test } from "bun:test";
import { geolocationErrorMessage } from "./geolocation";

test("cada fallo de la geolocalización ofrece elegir de la lista", () => {
  for (const code of [1, 2, 3, "unsupported"] as const) {
    expect(geolocationErrorMessage(code)).toContain("distrito de la lista");
  }
});

test("el permiso negado se explica como tal", () => {
  expect(geolocationErrorMessage(1)).toContain("permiso");
});
