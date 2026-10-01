"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Hammer, Plus } from "lucide-react";
import { FormAlert, FormNotice } from "@/components/form/form-alert";
import { IconBadge } from "@/components/layout/icon-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ApiListing } from "@/lib/api";
import { callBff } from "@/lib/bff-client";
import { formatSoles } from "@/lib/money";
import { ROUTES } from "@/lib/session";
import {
  ACTION_TEXT,
  isEditable,
  listingActions,
  STATUS_TEXT,
  type ListingAction,
} from "@/features/protected/my-listings/lib/listings";

const dateFormat = new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short", timeZone: "America/Lima" });

// Mis publicaciones: estado de cada una, el motivo si hay que corregirla y lo que se puede hacer.
// Cada acción manda la versión leída: si otra pestaña la cambió, qatu-api responde y se recarga.
export function MyListings({ listings }: { listings: ApiListing[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<string>();
  const [alert, setAlert] = useState<{ id: string; message: string }>();
  const [notice, setNotice] = useState<string>();

  async function act(listing: ApiListing, action: ListingAction) {
    if (action === "archive" && !window.confirm(`¿Archivar «${listing.title}»? Saldrá de Qatu y no podrás volver a publicarla.`))
      return;
    setPending(listing.id);
    setAlert(undefined);
    setNotice(undefined);
    const result = await callBff<ApiListing>(`/api/me/listings/${listing.id}/${action}`, {
      method: "POST",
      body: action === "duplicate" ? {} : { version: listing.version },
    });
    setPending(undefined);
    if (!result.ok) {
      setAlert({ id: listing.id, message: result.error.message });
      if (result.error.error === "version_desactualizada") router.refresh();
      return;
    }
    if (action === "duplicate") {
      router.push(`${ROUTES.myListings}/${result.data.id}`);
      return;
    }
    setNotice(`«${listing.title}»: ${ACTION_TEXT[action].done.toLowerCase()}`);
    router.refresh();
  }

  if (listings.length === 0) {
    return (
      <div className="flex max-w-xl flex-col items-center gap-4 rounded-[var(--radius-card)] border border-dashed border-line bg-bg p-8 text-center">
        <IconBadge icon={Hammer} />
        <div>
          <h2 className="text-lg font-semibold">Aún no tienes publicaciones</h2>
          <p className="mt-1 text-ink-2">Publica tu primera herramienta: te guiamos paso a paso.</p>
        </div>
        <Button asChild className="h-11 rounded-[var(--radius-control)]">
          <Link href={`${ROUTES.myListings}/nueva`}>
            <Plus strokeWidth={1.75} aria-hidden />
            Publicar una herramienta
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <FormNotice>{notice}</FormNotice>
      <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {listings.map((l) => {
          const status = STATUS_TEXT[l.status];
          return (
            <li key={l.id}>
              <article
                aria-labelledby={`publicacion-${l.id}`}
                className="flex h-full flex-col gap-3 rounded-[var(--radius-card)] border border-line bg-bg p-5 shadow-[var(--shadow-card)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 id={`publicacion-${l.id}`} className="min-w-0 break-words text-lg font-semibold">
                    <Link href={`${ROUTES.myListings}/${l.id}`} className="underline-offset-4 hover:underline">
                      {l.title}
                    </Link>
                  </h2>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </div>
                <p className="text-sm text-ink-2">
                  {l.prices.day > 0 ? `${formatSoles(l.prices.day)} por día` : "Sin precio por día aún"} · Actualizada el{" "}
                  {dateFormat.format(new Date(l.updated_at))}
                </p>
                {l.status === "rejected" && l.rejection_reason ? (
                  <p className="rounded-[var(--radius-control)] border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm">
                    <span className="font-medium">Motivo: </span>
                    {l.rejection_reason}
                  </p>
                ) : (
                  <p className="text-sm text-ink-3">{status.hint}</p>
                )}
                {alert?.id === l.id && <FormAlert>{alert.message}</FormAlert>}
                <div className="mt-auto flex flex-wrap gap-2 pt-1">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`${ROUTES.myListings}/${l.id}`} aria-label={`${isEditable(l.status) ? "Editar" : "Ver"} ${l.title}`}>
                      {isEditable(l.status) ? "Editar" : "Ver"}
                    </Link>
                  </Button>
                  {listingActions(l.status).map((action) => (
                    <Button
                      key={action}
                      type="button"
                      size="sm"
                      variant={action === "submit" ? "default" : "outline"}
                      disabled={pending === l.id}
                      onClick={() => act(l, action)}
                      aria-label={`${ACTION_TEXT[action].label}: ${l.title}`}
                    >
                      {ACTION_TEXT[action].label}
                    </Button>
                  ))}
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
