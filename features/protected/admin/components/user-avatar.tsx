import { cn } from "@/lib/utils";
import { initials } from "@/features/protected/admin/lib/users";

const SIZES = { sm: "size-9 text-xs", md: "size-12 text-base" } as const;

// Avatar con iniciales sobre el amarillo suave de marca (texto --ink, 8:1). Decorativo: el nombre va al lado.
export function UserAvatar({ name, size = "sm" }: { name: string; size?: keyof typeof SIZES }) {
  return (
    <span
      aria-hidden
      className={cn("flex shrink-0 items-center justify-center rounded-full bg-brand-soft font-semibold text-ink", SIZES[size])}
    >
      {initials(name)}
    </span>
  );
}
