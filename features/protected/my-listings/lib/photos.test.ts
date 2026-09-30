import { expect, test } from "bun:test";
import type { ApiPhoto } from "@/lib/api";
import { movePhoto, photoFileError, splitPhotos } from "./photos";

test("qué archivos se pueden subir", () => {
  expect(photoFileError({ type: "image/jpeg", size: 3_000_000 })).toBeUndefined();
  expect(photoFileError({ type: "image/heic", size: 1000 })).toContain("JPG");
  expect(photoFileError({ type: "image/png", size: 11 * 1024 * 1024 })).toContain("10 MB");
  expect(photoFileError({ type: "image/png", size: 0 })).toBeDefined();
});

const photo = (id: string, kind: ApiPhoto["kind"], status: ApiPhoto["status"]): ApiPhoto => ({
  id,
  kind,
  status,
  sort_order: 0,
  urls: {},
});

test("fotos por tipo: la placa aparte y las fallidas sin ocupar lugar", () => {
  const s = splitPhotos([photo("a", "public", "ready"), photo("b", "public", "pending"), photo("c", "serial", "ready"), photo("d", "public", "failed")]);
  expect(s.public.map((p) => p.id)).toEqual(["a", "b"]);
  expect(s.serial?.id).toBe("c");
  expect(s.failed.map((p) => p.id)).toEqual(["d"]);
  expect(s.ready).toBe(1);
});

test("mover una foto cambia la portada", () => {
  expect(movePhoto(["a", "b", "c"], "b", -1)).toEqual(["b", "a", "c"]);
  expect(movePhoto(["a", "b", "c"], "c", 1)).toEqual(["a", "b", "c"]);
  expect(movePhoto(["a", "b"], "x", 1)).toEqual(["a", "b"]);
});
