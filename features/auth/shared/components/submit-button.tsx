import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  pending: boolean;
  label: string;
  pendingLabel: string;
}

// Acción principal de las pantallas de acceso: ámbar de marca (--brand-text) con texto blanco
// (5,02:1). Una por pantalla. También la usa un enlace que cumple ese papel (Button asChild).
export const PRIMARY_ACTION =
  "group h-12 rounded-[var(--radius-control)] bg-brand-text text-[15px] font-semibold text-white shadow-[0_10px_20px_-10px_rgb(180_83_9/0.6)] hover:bg-brand-text/90";

export function ActionArrow() {
  return (
    <ArrowRight
      className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
      strokeWidth={2}
      aria-hidden
    />
  );
}

export function SubmitButton({ pending, label, pendingLabel }: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={pending} className={PRIMARY_ACTION}>
      {pending ? pendingLabel : label}
      {!pending && <ActionArrow />}
    </Button>
  );
}
