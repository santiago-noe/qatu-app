"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, LockKeyhole, Trash2 } from "lucide-react";
import { FormAlert, FormNotice } from "@/components/form/form-alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ApiListing, ApiPhoto } from "@/lib/api";
import { callBff } from "@/lib/bff-client";
import {
  movePhoto,
  photoFileError,
  PHOTO_TYPES,
  PUBLIC_PHOTOS_MAX,
  PUBLIC_PHOTOS_MIN,
  splitPhotos,
  uploadPhoto,
} from "@/features/protected/my-listings/lib/photos";

// Mientras haya fotos procesándose se consulta cada 2 s (una foto tarda uno o dos segundos).
const POLL_MS = 2000;
const POLL_MAX = 30;

interface PhotosSectionProps {
  listing: ApiListing;
  photos: ApiPhoto[];
  editable: boolean;
}

// Fotos: mínimo 3 y máximo 12 públicas (la primera es la portada) y la de la placa o número de
// serie, privada: solo la ven el dueño y soporte (docs/02, A1 paso 2).
export function PhotosSection({ listing, photos: initial, editable }: PhotosSectionProps) {
  const router = useRouter();
  const inputId = useId();
  const [photos, setPhotos] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [alert, setAlert] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const { public: publicPhotos, serial, failed, ready } = splitPhotos(photos);
  const pending = photos.some((p) => p.status === "pending");
  const base = `/api/me/listings/${listing.id}/photos`;

  async function reload() {
    const result = await callBff<{ photos: ApiPhoto[] }>(base);
    if (result.ok) setPhotos(result.data.photos);
    return result.ok ? result.data.photos : photos;
  }

  // Sigue el procesamiento; al terminar, la página se vuelve a leer (la lista de pendientes cambia).
  useEffect(() => {
    if (!pending) return;
    let tries = 0;
    const timer = setInterval(async () => {
      tries++;
      const latest = await reload();
      if (!latest.some((p) => p.status === "pending") || tries >= POLL_MAX) {
        clearInterval(timer);
        router.refresh();
      }
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [pending]);

  async function upload(files: File[], kind: ApiPhoto["kind"]) {
    setAlert(undefined);
    setNotice(undefined);
    const room = kind === "serial" ? 1 : PUBLIC_PHOTOS_MAX - publicPhotos.length;
    if (files.length > room) {
      setAlert(`Puedes agregar ${room} foto${room === 1 ? "" : "s"} más.`);
      return;
    }
    const invalid = files.map(photoFileError).find(Boolean);
    if (invalid) {
      setAlert(invalid);
      return;
    }
    setBusy(true);
    let uploaded = 0;
    for (const file of files) {
      const result = await uploadPhoto(listing.id, kind, file);
      if (!result.ok) {
        setAlert(result.error.message);
        break;
      }
      uploaded++;
    }
    setBusy(false);
    if (uploaded > 0) setNotice(uploaded === 1 ? "Subimos la foto. La estamos preparando." : `Subimos ${uploaded} fotos. Las estamos preparando.`);
    await reload();
  }

  async function remove(photo: ApiPhoto) {
    setAlert(undefined);
    setNotice(undefined);
    setBusy(true);
    const result = await callBff(`${base}/${photo.id}`, { method: "DELETE", body: {} });
    setBusy(false);
    if (!result.ok) {
      setAlert(result.error.message);
      return;
    }
    setNotice("Quitamos la foto.");
    await reload();
    router.refresh();
  }

  async function move(photo: ApiPhoto, delta: -1 | 1) {
    const ids = movePhoto(
      publicPhotos.map((p) => p.id),
      photo.id,
      delta,
    );
    setBusy(true);
    const result = await callBff<{ photos: ApiPhoto[] }>(`${base}/order`, { method: "PUT", body: { ids } });
    setBusy(false);
    if (result.ok) setPhotos(result.data.photos);
    else setAlert(result.error.message);
  }

  const fileInput = (kind: ApiPhoto["kind"], label: string, multiple: boolean) => (
    <label
      htmlFor={`${inputId}-${kind}`}
      className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-[var(--radius-control)] border border-line bg-bg px-4 text-sm font-medium transition-colors hover:bg-bg-soft has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ink has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50"
    >
      <ImagePlus className="size-4" strokeWidth={1.75} aria-hidden />
      {busy ? "Subiendo…" : label}
      <input
        id={`${inputId}-${kind}`}
        type="file"
        accept={PHOTO_TYPES.join(",")}
        multiple={multiple}
        disabled={busy || !editable}
        className="sr-only"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (files.length) void upload(files, kind);
        }}
      />
    </label>
  );

  return (
    <section
      id="fotos"
      aria-labelledby="fotos-titulo"
      className="@container flex scroll-mt-6 flex-col gap-5 rounded-[var(--radius-card)] border border-line bg-bg p-5 sm:p-6"
    >
      <div>
        <h2 id="fotos-titulo" className="text-lg font-semibold">
          Fotos
        </h2>
        <p className="mt-1 text-sm text-ink-2">
          Entre {PUBLIC_PHOTOS_MIN} y {PUBLIC_PHOTOS_MAX}, con buena luz y desde varios ángulos. La primera es la portada.
          Quitamos los datos de ubicación que guardan las fotos del celular.
        </p>
      </div>
      <FormAlert>{alert}</FormAlert>
      <FormNotice>{notice}</FormNotice>

      <div className="flex flex-wrap items-center gap-3">
        {editable && publicPhotos.length < PUBLIC_PHOTOS_MAX && fileInput("public", "Agregar fotos", true)}
        <p className="text-sm text-ink-2" aria-live="polite">
          {ready} de {PUBLIC_PHOTOS_MIN} fotos mínimas listas{pending ? " · preparando fotos…" : ""}
        </p>
      </div>

      {publicPhotos.length > 0 && (
        <ol className="grid grid-cols-2 gap-3 @md:grid-cols-3 @3xl:grid-cols-4">
          {publicPhotos.map((p, i) => (
            <li key={p.id} className="flex flex-col gap-2 rounded-[var(--radius-control)] border border-line p-2">
              <div className="relative aspect-square overflow-hidden rounded-[calc(var(--radius-control)-2px)] bg-bg-soft">
                {p.status === "ready" ? (
                  <img src={p.urls["320"]} alt={`Foto ${i + 1} de ${listing.title}`} className="size-full object-cover" loading="lazy" />
                ) : (
                  <span className="flex size-full items-center justify-center p-2 text-center text-sm text-ink-2">Preparando…</span>
                )}
                {i === 0 && (
                  <span className="absolute left-2 top-2">
                    <Badge tone="ok">Portada</Badge>
                  </span>
                )}
              </div>
              {editable && (
                <div className="flex justify-between gap-1">
                  <Button type="button" variant="ghost" size="icon-sm" disabled={busy || i === 0} onClick={() => move(p, -1)} aria-label={`Mover la foto ${i + 1} antes`}>
                    <ArrowLeft strokeWidth={1.75} aria-hidden />
                  </Button>
                  <Button type="button" variant="ghost" size="icon-sm" disabled={busy} onClick={() => remove(p)} aria-label={`Quitar la foto ${i + 1}`}>
                    <Trash2 strokeWidth={1.75} aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={busy || i === publicPhotos.length - 1}
                    onClick={() => move(p, 1)}
                    aria-label={`Mover la foto ${i + 1} después`}
                  >
                    <ArrowRight strokeWidth={1.75} aria-hidden />
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
      {failed.length > 0 && (
        <p className="text-sm text-destructive">
          {failed.length === 1 ? "Una foto no se pudo leer" : `${failed.length} fotos no se pudieron leer`}: prueba con otro archivo.
        </p>
      )}

      <div className="flex flex-col gap-3 border-t border-line pt-5">
        <h3 className="flex items-center gap-2 font-medium">
          <LockKeyhole className="size-4 text-ink-2" strokeWidth={1.75} aria-hidden />
          Placa o número de serie (privada)
        </h3>
        <p className="text-sm text-ink-2">Solo la ven tú y soporte, para identificar la herramienta si hay un reclamo.</p>
        <div className="flex flex-wrap items-center gap-3">
          {serial?.status === "ready" && (
            <img src={serial.urls["320"]} alt={`Placa de ${listing.title}`} className="size-20 rounded-[var(--radius-control)] object-cover" />
          )}
          {serial?.status === "pending" && <span className="text-sm text-ink-2">Preparando…</span>}
          {editable && fileInput("serial", serial ? "Cambiar la foto de la placa" : "Agregar la foto de la placa", false)}
        </div>
      </div>
    </section>
  );
}
