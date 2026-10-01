"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { FormAlert } from "@/components/form/form-alert";
import { TextareaField } from "@/components/form/textarea-field";
import { IconBadge } from "@/components/layout/icon-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ApiListing, ApiReviewItem } from "@/lib/api";
import { callBff } from "@/lib/bff-client";
import { REJECTION_REASON_MAX, rejectionError, reviewAttributes, reviewFacts, type Fact } from "@/features/protected/moderation/lib/review";

const RISK_TEXT = { low: "Riesgo bajo", medium: "Riesgo medio", high: "Riesgo alto" } as const;

function Facts({ facts }: { facts: Fact[] }) {
  return (
    <dl className="grid gap-x-6 gap-y-2 text-sm @xl:grid-cols-2">
      {facts.map((f) => (
        <div key={f.label} className="flex flex-col">
          <dt className="text-ink-3">{f.label}</dt>
          <dd className="text-ink">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

// Una publicación en revisión: lo que se publicará y las dos decisiones. Rechazar pide un motivo
// que el arrendador lee para corregirla.
function ReviewCard({ item, zones }: { item: ApiReviewItem; zones: Record<string, string> }) {
  const router = useRouter();
  const { listing: l } = item;
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string>();
  const [pending, setPending] = useState(false);
  const [alert, setAlert] = useState<string>();
  const headingId = `revision-${l.id}`;

  async function decide(action: "approve" | "reject") {
    if (action === "reject") {
      const error = rejectionError(reason);
      setReasonError(error);
      if (error) return;
    }
    setPending(true);
    setAlert(undefined);
    const result = await callBff<ApiListing>(`/api/moderation/listings/${l.id}/${action}`, {
      method: "POST",
      body: action === "reject" ? { version: l.version, reason: reason.trim() } : { version: l.version },
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
    <article
      aria-labelledby={headingId}
      className="@container flex flex-col gap-4 rounded-[var(--radius-card)] border border-line bg-bg p-5 shadow-[var(--shadow-card)] sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id={headingId} className="break-words text-lg font-semibold">
            {l.title}
          </h2>
          <p className="text-sm text-ink-2">
            {item.category.name} · de {item.owner.name}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {item.owner.first_listing && <Badge tone="warn">Primera publicación</Badge>}
          <Badge tone={item.category.risk_level === "high" ? "warn" : "neutral"}>{RISK_TEXT[item.category.risk_level]}</Badge>
        </div>
      </div>

      {item.photos.length > 0 && (
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {item.photos.map((p, i) => (
            <li key={p.id} className="shrink-0">
              <a href={p.urls["1600"]} target="_blank" rel="noreferrer" className="block">
                <img
                  src={p.urls["320"]}
                  alt={`Foto ${i + 1} de ${l.title} (abre en grande)`}
                  className="size-28 rounded-[var(--radius-control)] border border-line object-cover"
                  loading="lazy"
                />
              </a>
            </li>
          ))}
        </ul>
      )}

      {l.description && <p className="whitespace-pre-line text-sm text-ink">{l.description}</p>}
      <Facts facts={reviewFacts(item, (id) => zones[id])} />
      {reviewAttributes(item).length > 0 && (
        <div className="flex flex-col gap-2 border-t border-line pt-4">
          <h3 className="text-sm font-medium">Datos de la herramienta</h3>
          <Facts facts={reviewAttributes(item)} />
        </div>
      )}
      {l.accessories.length > 0 && (
        <p className="text-sm">
          <span className="text-ink-3">Accesorios: </span>
          {l.accessories.join(", ")}
        </p>
      )}
      {l.usage_instructions && (
        <p className="whitespace-pre-line text-sm">
          <span className="text-ink-3">Instrucciones de uso: </span>
          {l.usage_instructions}
        </p>
      )}

      <FormAlert>{alert}</FormAlert>
      {rejecting && (
        <TextareaField
          label="Motivo del rechazo"
          name="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={REJECTION_REASON_MAX}
          rows={3}
          hint="El arrendador lo lee en su correo y en Mis publicaciones. Di qué corregir."
          error={reasonError}
          autoFocus
        />
      )}
      <div className="flex flex-wrap gap-2 border-t border-line pt-4">
        {rejecting ? (
          <>
            <Button type="button" variant="destructive" disabled={pending} onClick={() => decide("reject")} className="h-10 rounded-[var(--radius-control)]">
              {pending ? "Enviando…" : "Rechazar con este motivo"}
            </Button>
            <Button type="button" variant="outline" disabled={pending} onClick={() => setRejecting(false)} className="h-10 rounded-[var(--radius-control)]">
              Cancelar
            </Button>
          </>
        ) : (
          <>
            <Button type="button" disabled={pending} onClick={() => decide("approve")} className="h-10 rounded-[var(--radius-control)]" aria-label={`Aprobar ${l.title}`}>
              {pending ? "Enviando…" : "Aprobar y publicar"}
            </Button>
            <Button type="button" variant="outline" disabled={pending} onClick={() => setRejecting(true)} className="h-10 rounded-[var(--radius-control)]" aria-label={`Rechazar ${l.title}`}>
              Rechazar
            </Button>
          </>
        )}
      </div>
    </article>
  );
}

// Cola de moderación: la que más espera primero. Nunca muestra el punto exacto ni la placa.
export function ModerationQueue({ items, zones }: { items: ApiReviewItem[]; zones: Record<string, string> }) {
  if (items.length === 0) {
    return (
      <div className="flex max-w-xl flex-col items-center gap-3 rounded-[var(--radius-card)] border border-dashed border-line bg-bg p-8 text-center">
        <IconBadge icon={ClipboardCheck} />
        <p className="font-medium">No hay publicaciones esperando revisión.</p>
      </div>
    );
  }
  return (
    <div className="flex max-w-4xl flex-col gap-4">
      <p className="text-sm text-ink-2" aria-live="polite">
        {items.length === 1 ? "1 publicación esperando revisión." : `${items.length} publicaciones esperando revisión.`}
      </p>
      {items.map((item) => (
        <ReviewCard key={item.listing.id} item={item} zones={zones} />
      ))}
    </div>
  );
}
