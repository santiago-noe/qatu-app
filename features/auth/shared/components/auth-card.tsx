import { Logo } from "@/components/layout/logo";

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  /** Enlace alternativo al pie ("¿Aún no tienes cuenta? Regístrate gratis"). */
  footer?: React.ReactNode;
}

// Columna del formulario de acceso: logo (vuelve al inicio), título, texto y formulario.
export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="mx-auto w-full max-w-[420px]">
      <Logo priority height={36} />
      <h1 className="mt-5 text-2xl font-bold tracking-tight text-ink sm:text-[26px]">{title}</h1>
      <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">{description}</p>
      <div className="mt-5">{children}</div>
      {footer && <p className="mt-5 text-center text-sm text-ink-2">{footer}</p>}
    </div>
  );
}
