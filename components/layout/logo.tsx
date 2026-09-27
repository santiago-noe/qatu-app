import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/session";

// Proporción del archivo public/brand/logo-0.png (865 × 311).
const LOGO = { src: "/brand/logo-0.png", width: 865, height: 311 } as const;
// Ícono de app/icon.png, servido por Next en /icon.png.
const ICON_SRC = "/icon.png";

interface LogoProps {
  /** Alto en píxeles; el ancho se calcula con la proporción del archivo. */
  height?: number;
  /** "light": para fondos oscuros, mientras no exista la versión blanca del logo. */
  variant?: "default" | "light";
  className?: string;
  priority?: boolean;
}

// Logo único del proyecto: enlaza al inicio.
export function Logo({ height = 40, variant = "default", className, priority }: LogoProps) {
  const linkClass = cn("inline-flex shrink-0 items-center", className);

  if (variant === "light") {
    return (
      <Link href={ROUTES.home} aria-label="Qatu, inicio" className={cn(linkClass, "gap-2.5")}>
        {/* El ícono tiene partes gris oscuro: va sobre una pastilla blanca para verse en fondo oscuro */}
        <span className="flex items-center justify-center rounded-[var(--radius-control)] bg-white p-1">
          <Image src={ICON_SRC} alt="" width={height - 8} height={height - 8} />
        </span>
        <span className="text-2xl font-semibold tracking-tight text-white">Qatu</span>
      </Link>
    );
  }

  const width = Math.round((height * LOGO.width) / LOGO.height);
  return (
    <Link href={ROUTES.home} aria-label="Qatu, inicio" className={linkClass}>
      <Image src={LOGO.src} alt="Qatu" width={width} height={height} priority={priority} />
    </Link>
  );
}
