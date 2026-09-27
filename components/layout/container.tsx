import { cn } from "@/lib/utils";

// Ancho y márgenes laterales comunes a todas las secciones públicas.
export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-[1200px] px-4 md:px-12", className)} {...props} />;
}
