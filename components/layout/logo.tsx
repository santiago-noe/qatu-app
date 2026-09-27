import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/session";

// Proporción del archivo public/brand/logo-0.png (865 × 311).
const LOGO = { src: "/brand/logo-0.png", width: 865, height: 311 } as const;

interface LogoProps {
  /** Alto en píxeles; el ancho se calcula con la proporción del archivo. */
  height?: number;
  className?: string;
  priority?: boolean;
}

// Logo único del proyecto: enlaza al inicio.
export function Logo({ height = 40, className, priority }: LogoProps) {
  const width = Math.round((height * LOGO.width) / LOGO.height);
  return (
    <Link href={ROUTES.home} aria-label="Qatu, inicio" className={cn("inline-flex shrink-0", className)}>
      <Image src={LOGO.src} alt="Qatu" width={width} height={height} priority={priority} />
    </Link>
  );
}
