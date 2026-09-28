import { CircleAlert, CircleCheck } from "lucide-react";

// Error general del formulario (no ligado a un campo): credenciales, límite de intentos, servicio caído.
export function FormAlert({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-[var(--radius-control)] border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} aria-hidden />
      <span>{children}</span>
    </p>
  );
}

// Confirmación del formulario ("Te enviamos un código nuevo"). role="status": se anuncia sin interrumpir.
export function FormNotice({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p
      role="status"
      className="flex items-start gap-2 rounded-[var(--radius-control)] border border-ok/30 bg-ok/5 px-3 py-2.5 text-sm text-ink"
    >
      <CircleCheck className="mt-0.5 size-4 shrink-0 text-ok" strokeWidth={1.5} aria-hidden />
      <span>{children}</span>
    </p>
  );
}
