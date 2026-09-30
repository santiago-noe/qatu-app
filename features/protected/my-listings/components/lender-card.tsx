import Link from "next/link";
import { Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ApiLender } from "@/lib/api";
import { ROUTES } from "@/lib/session";

// Tarjeta del panel: invita a publicar o lleva a las publicaciones del arrendador.
export function LenderCard({ lender, listings }: { lender: ApiLender | null; listings: number }) {
  return (
    <section aria-labelledby="mis-herramientas" className="rounded-[var(--radius-card)] border border-line bg-bg p-5">
      <h2 id="mis-herramientas" className="flex items-center gap-2 text-base font-semibold">
        <Hammer className="size-5 text-brand-text" strokeWidth={1.75} aria-hidden />
        {lender ? "Mis herramientas en alquiler" : "¿Tienes herramientas sin usar?"}
      </h2>
      <p className="mt-1 text-sm text-ink-2">
        {lender
          ? listings === 1
            ? "Tienes 1 publicación."
            : `Tienes ${listings} publicaciones.`
          : "Alquílalas en Qatu a personas de tu ciudad."}
      </p>
      <Button asChild variant={lender ? "outline" : "default"} className="mt-4 h-10 rounded-[var(--radius-control)]">
        <Link href={lender ? ROUTES.myListings : ROUTES.lender}>{lender ? "Ver mis publicaciones" : "Publicar mis herramientas"}</Link>
      </Button>
    </section>
  );
}
