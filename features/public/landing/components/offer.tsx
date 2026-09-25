import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OFFER } from "../lib/content";
import { ROUTES } from "@/lib/session";

export function Offer() {
  return (
    <section id="ofrece-en-qatu" className="bg-surface py-14" aria-labelledby="h-ofrece">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <div className="space-y-5 rounded-3xl bg-inverse-surface p-6 text-inverse-on-surface shadow-xl md:p-10">
          <p className="text-xs font-bold uppercase tracking-wider text-tertiary-fixed">
            Ofrece en Qatu
          </p>
          <h2 id="h-ofrece" className="max-w-2xl text-2xl font-extrabold md:text-3xl">
            {OFFER.heading}
          </h2>
          <ul className="space-y-3 text-sm md:text-base">
            {OFFER.points.map((p) => (
              <li key={p.lead} className="flex items-start gap-2">
                <CircleCheck className="mt-0.5 size-5 shrink-0 text-tertiary-fixed" aria-hidden />
                <span>
                  <strong>{p.lead}</strong> {p.text}
                </span>
              </li>
            ))}
          </ul>
          <Button asChild size="lg" className="h-12 rounded-xl px-6 font-semibold">
            <Link href={ROUTES.signin}>{OFFER.cta}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
