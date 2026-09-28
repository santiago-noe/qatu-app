import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { box: "size-9", icon: "size-[18px]" },
  md: { box: "size-11", icon: "size-5" },
} as const;

interface IconBadgeProps {
  icon: LucideIcon;
  size?: keyof typeof SIZES;
  className?: string;
}

// Ícono de línea dentro de un círculo amarillo suave (chips del hero, oficios).
export function IconBadge({ icon: Icon, size = "md", className }: IconBadgeProps) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-brand-soft text-ink",
        SIZES[size].box,
        className,
      )}
    >
      <Icon className={SIZES[size].icon} strokeWidth={1.5} aria-hidden />
    </span>
  );
}
