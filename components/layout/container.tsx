import { cn } from "@/lib/utils";

const SIZES = {
  /** Secciones de contenido. */
  default: "max-w-[1200px] px-4 md:px-12",
  /** Cabecera y barras: aprovechan más el ancho de pantalla. */
  wide: "max-w-[1440px] px-4 md:px-6 lg:px-8",
} as const;

interface ContainerProps extends React.ComponentProps<"div"> {
  size?: keyof typeof SIZES;
}

// Ancho y márgenes laterales comunes a todas las secciones públicas.
export function Container({ size = "default", className, ...props }: ContainerProps) {
  return <div className={cn("mx-auto w-full", SIZES[size], className)} {...props} />;
}
