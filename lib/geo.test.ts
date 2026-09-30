import { expect, test } from "bun:test";
import { circlePolygon, distanceMeters } from "./geo";

test("el círculo está a su radio del centro y cierra", () => {
  const center = { lat: -13.1631, lng: -74.2237 };
  const ring = circlePolygon(center, 500, 32);
  expect(ring).toHaveLength(33);
  expect(ring[0]).toEqual(ring[32]);
  for (const [lng, lat] of ring) {
    expect(Math.abs(distanceMeters(center, { lat, lng }) - 500)).toBeLessThan(1);
  }
});

test("distancia conocida: Plaza de Armas de Ayacucho a unos 500 m", () => {
  const d = distanceMeters({ lat: -13.1631, lng: -74.2237 }, { lat: -13.159, lng: -74.221 });
  expect(d).toBeGreaterThan(450);
  expect(d).toBeLessThan(600);
});
