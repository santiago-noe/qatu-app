"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CircleCheck, CircleDashed } from "lucide-react";
import { FormAlert } from "@/components/form/form-alert";
import { Button } from "@/components/ui/button";
import type { ApiListing } from "@/lib/api";
import { callBff } from "@/lib/bff-client";
import { publishChecklist } from "@/features/protected/my-listings/lib/listings";

// Lo que falta para publicar y el botón para enviarla (borrador o rechazada ya corregida).
// qatu-api decide si pasa por revisión (primera publicación o riesgo alto) o se publica directo.
export function SubmitPanel({ listing, readyPhotos }: { listing: ApiListing; readyPhotos: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [alert, setAlert] = useState<string>();
  const checklist = publishChecklist(listing, readyPhotos);
  const complete = checklist.every((i) => i.done);

  async function submit() {
    setPending(true);
    setAlert(undefined);
    const result = await callBff<ApiListing>(`/api/me/listings/${listing.id}/submit`, {
      method: "POST",
      body: { version: listing.version },
    });
    setPending(false);
    if (!result.ok) {
      setAlert(result.error.message);
      if (result.error.error === "version_desactualizada") router.refresh();
      return;
    }
    router.refresh();
  }

  return (
    <section aria-labelledby="enviar-titulo" className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-line bg-bg p-5 sm:p-6">
      <h2 id="enviar-titulo" className="text-lg font-semibold">
        Enviar a publicar
      </h2>
      <ul className="flex flex-col gap-2">
        {checklist.map((item) => (
          <li key={item.key} className="flex items-center gap-2 text-sm">
            {item.done ? (
              <CircleCheck className="size-4 shrink-0 text-ok" strokeWidth={1.75} aria-hidden />
            ) : (
              <CircleDashed className="size-4 shrink-0 text-ink-3" strokeWidth={1.75} aria-hidden />
            )}
            <span className={item.done ? "text-ink" : "text-ink-2"}>
              {item.label}
              <span className="sr-only">{item.done ? ": listo" : ": falta"}</span>
            </span>
          </li>
        ))}
      </ul>
      <FormAlert>{alert}</FormAlert>
      <div>
        <Button type="button" onClick={submit} disabled={!complete || pending} className="h-11 rounded-[var(--radius-control)] px-6">
          {pending ? "Enviando…" : "Enviar a publicar"}
        </Button>
        {!complete && <p className="mt-2 text-xs text-ink-3">Completa lo que falta para poder enviarla.</p>}
      </div>
    </section>
  );
}
