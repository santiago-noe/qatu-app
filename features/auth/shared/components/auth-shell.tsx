import type { Showcase } from "@/features/auth/shared/lib/showcase";
import { AuthShowcase } from "./auth-showcase";

interface AuthShellProps {
  showcase: Showcase;
  children: React.ReactNode;
}

// Página de acceso: una sola tarjeta dividida, sin cabecera ni pie del sitio. Desde lg, panel
// oscuro de marca a la izquierda y formulario a la derecha; en móvil y tablet, solo el formulario.
export function AuthShell({ showcase, children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-soft bg-[radial-gradient(ellipse_60%_50%_at_0%_0%,var(--color-cream),transparent),radial-gradient(ellipse_50%_40%_at_100%_100%,var(--color-brand-soft),transparent)] px-3 py-4 sm:px-6 sm:py-6 lg:py-4">
      <main className="w-full max-w-[1080px] overflow-hidden rounded-3xl border border-line bg-bg shadow-[0_40px_80px_-40px_rgb(31_41_55/0.45)] lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <AuthShowcase showcase={showcase} className="hidden lg:flex" />
        <div className="px-5 py-7 sm:px-10 sm:py-8 lg:px-12 lg:py-7">{children}</div>
      </main>
    </div>
  );
}
