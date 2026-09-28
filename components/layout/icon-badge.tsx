import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { box: "size-9", icon: "size-[18px]" },
  md: { box: "size-11", icon: "size-5" },
} as const;

const TONES = {
  /** Amarillo suave: chips del hero y oficios. */
  soft: "bg-brand-soft",
  /** Amarillo de marca con ícono oscuro (8,41:1): beneficios de las pantallas de acceso. */
  solid: "bg-brand",
} as const;

interface IconBadgeProps {
  icon: LucideIcon;
  size?: keyof typeof SIZES;
  tone?: keyof typeof TONES;
  className?: string;
}

// Ícono de línea dentro de un círculo amarillo.
export function IconBadge({ icon: Icon, size = "md", tone = "soft", className }: IconBadgeProps) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full text-ink",
        SIZES[size].box,
        TONES[tone],
        className,
      )}
    >
      <Icon className={SIZES[size].icon} strokeWidth={1.5} aria-hidden />
    </span>
  );
}
