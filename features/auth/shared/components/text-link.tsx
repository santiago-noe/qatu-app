import Link from "next/link";
import { cn } from "@/lib/utils";

// Enlace de texto de las pantallas de acceso: ámbar para texto (--brand-text, 5,02:1).
export function TextLink({ className, ...props }: React.ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn("font-medium text-brand-text underline-offset-4 hover:underline", className)}
      {...props}
    />
  );
}
