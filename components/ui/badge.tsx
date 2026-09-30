import { cn } from "@/lib/utils";

const TONES = {
  neutral: "border-line bg-bg-soft text-ink-2",
  ok: "border-ok/30 bg-ok/5 text-ok",
  warn: "border-brand-text/40 bg-bg text-brand-text", // 5,02:1 sobre blanco (sobre crema no llega a 4,5:1)
  danger: "border-destructive/30 bg-destructive/5 text-destructive",
} as const;

// Etiqueta de estado (Apagada, Prohibida, Riesgo alto…). El texto dice el estado: el color solo acompaña.
export function Badge({ tone = "neutral", children }: { tone?: keyof typeof TONES; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", TONES[tone])}>
      {children}
    </span>
  );
}
