interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  /** Enlace alternativo bajo la tarjeta ("¿No tienes cuenta? Regístrate"). */
  footer?: React.ReactNode;
}

// Marco común de las pantallas de acceso: título, texto y formulario en una tarjeta.
export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="w-full max-w-md">
      <div className="rounded-[var(--radius-card)] border border-line bg-bg px-5 py-8 sm:px-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        <p className="mt-1.5 text-[15px] text-ink-2">{description}</p>
        <div className="mt-6">{children}</div>
      </div>
      {footer && <p className="mt-6 text-center text-sm text-ink-2">{footer}</p>}
    </div>
  );
}
