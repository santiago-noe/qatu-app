import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  /** Enlace o botón alineado a la derecha del encabezado (por ejemplo, "Ver todos"). */
  action?: React.ReactNode;
  className?: string;
}

// Antetítulo + H2 + descripción: encabezado común de las secciones públicas.
export function SectionHeading({ id, eyebrow, title, description, action, className }: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="space-y-2">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id} className="text-2xl font-semibold tracking-[-0.01em] text-ink md:text-[32px]">
          {title}
        </h2>
        {description && <p className="max-w-xl text-[15px] text-ink-2">{description}</p>}
      </div>
      {action}
    </div>
  );
}
