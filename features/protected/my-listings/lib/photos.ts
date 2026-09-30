// Fotos de una publicación. El navegador pide una URL firmada a qatu-api (por el BFF), sube el
// archivo directo al almacenamiento y confirma; qatu-api genera los tamaños sin EXIF.
import type { ApiPhoto, ApiPhotoUpload } from "@/lib/api";
import { callBff, type BffResult } from "@/lib/bff-client";

export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const PHOTO_MAX_BYTES = 10 * 1024 * 1024;
export const PUBLIC_PHOTOS_MAX = 12;
export const PUBLIC_PHOTOS_MIN = 3;

/** Motivo para no subir el archivo, o undefined si se puede (qatu-api vuelve a revisarlo). */
export function photoFileError(file: { type: string; size: number }): string | undefined {
  if (!PHOTO_TYPES.includes(file.type)) return "Sube una foto JPG, PNG o WebP.";
  if (file.size === 0 || file.size > PHOTO_MAX_BYTES) return "La foto pesa más de 10 MB.";
  return undefined;
}

export function splitPhotos(photos: ApiPhoto[]) {
  const visible = photos.filter((p) => p.status !== "failed");
  return {
    public: visible.filter((p) => p.kind === "public"),
    serial: visible.find((p) => p.kind === "serial"),
    failed: photos.filter((p) => p.status === "failed"),
    ready: photos.filter((p) => p.kind === "public" && p.status === "ready").length,
  };
}

/** Nuevo orden al mover una foto (la primera es la portada). */
export function movePhoto(ids: string[], id: string, delta: -1 | 1): string[] {
  const from = ids.indexOf(id);
  const to = from + delta;
  if (from < 0 || to < 0 || to >= ids.length) return ids;
  const next = [...ids];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

const UPLOAD_FAILED = { error: "subida_fallida", message: "No pudimos subir la foto. Revisa tu conexión e inténtalo de nuevo." };

/** Sube una foto completa: pide la URL, hace el PUT directo y confirma. */
export async function uploadPhoto(listingId: string, kind: ApiPhoto["kind"], file: File): Promise<BffResult<ApiPhoto>> {
  const base = `/api/me/listings/${listingId}/photos`;
  const requested = await callBff<ApiPhotoUpload>(base, {
    method: "POST",
    body: { kind, content_type: file.type, size: file.size },
  });
  if (!requested.ok) return requested;
  const { photo, upload } = requested.data;
  try {
    const res = await fetch(upload.url, { method: upload.method, headers: upload.headers, body: file });
    if (!res.ok) return { ok: false, error: UPLOAD_FAILED };
  } catch {
    return { ok: false, error: UPLOAD_FAILED };
  }
  const completed = await callBff(`${base}/${photo.id}/complete`, { method: "POST", body: {} });
  return completed.ok ? { ok: true, data: photo } : completed;
}
