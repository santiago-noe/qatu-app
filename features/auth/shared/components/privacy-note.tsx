import { ShieldCheck } from "lucide-react";
import { TextLink } from "./text-link";
import { ROUTES } from "@/lib/session";

// Aviso de protección de datos (Ley 29733) bajo las opciones de acceso. Solo afirma lo que
// Qatu cumple: el tratamiento está descrito en la política de privacidad.
export function PrivacyNote() {
  return (
    <p className="flex items-start gap-2 rounded-xl border border-line bg-bg-soft px-3 py-2.5 text-xs leading-relaxed text-ink-2">
      <ShieldCheck className="mt-px size-4 shrink-0 text-ok" strokeWidth={1.75} aria-hidden />
      <span>
        Tratamos tus datos según la <strong className="font-semibold text-ink">Ley N.º 29733</strong>.{" "}
        <TextLink href={ROUTES.privacy}>Ver política de privacidad</TextLink>
      </span>
    </p>
  );
}
