import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
}

// Antetítulo + H2 + descripción: encabezado común de las secciones públicas.
export function SectionHeading({ id, eyebrow, title, description, className }: SectionHeadingProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="text-2xl font-semibold tracking-[-0.01em] text-ink md:text-[32px]">
        {title}
      </h2>
      {description && <p className="max-w-xl text-[15px] text-ink-2">{description}</p>}
    </div>
  );
}
