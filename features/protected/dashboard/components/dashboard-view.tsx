import Link from "next/link";
import { CircleAlert, CircleCheck, ShieldCheck } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import type { ApiUser } from "@/lib/api";
import { ROUTES } from "@/lib/session";
import { TextLink } from "@/features/auth/shared/components/text-link";
import { PANEL_ACTION, PANEL_LABEL, PanelHeader } from "@/features/protected/shared/components/panel-header";

interface DashboardViewProps {
  user: ApiUser;
  /** Secciones de otras features (ubicación, alquileres, servicios…): la página las compone. */
  children?: React.ReactNode;
}

// Panel inicial: confirma la cuenta y su estado. Las secciones se suman con sus features.
export function DashboardView({ user, children }: DashboardViewProps) {
  const firstName = user.name.split(" ")[0];

  return (
    <div className="min-h-screen bg-bg-soft">
      <PanelHeader>
        {(user.roles.includes("admin") || user.roles.includes("moderator")) && (
          <Button asChild variant="outline" className={PANEL_ACTION}>
            <Link href={ROUTES.admin}>
              <ShieldCheck strokeWidth={1.5} aria-hidden />
              <span className={PANEL_LABEL}>{user.roles.includes("admin") ? "Administración" : "Moderación"}</span>
            </Link>
          </Button>
        )}
      </PanelHeader>

      <main>
        <Container className="py-10 sm:py-14">
          <p className="eyebrow">Mi panel</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Hola, {firstName}</h1>
          <p className="mt-2 text-ink-2">{user.email}</p>

          <div className="mt-8 grid max-w-4xl items-start gap-5 lg:grid-cols-2">
            <section aria-labelledby="estado-cuenta" className="rounded-[var(--radius-card)] border border-line bg-bg p-5">
              <h2 id="estado-cuenta" className="text-base font-semibold">
                Estado de tu cuenta
              </h2>
              {user.email_verified ? (
                <p className="mt-3 flex items-start gap-2 text-sm text-ink-2">
                  <CircleCheck className="mt-0.5 size-4 shrink-0 text-ok" strokeWidth={1.5} aria-hidden />
                  Correo verificado. Ya puedes alquilar y contratar.
                </p>
              ) : (
                <p className="mt-3 flex items-start gap-2 text-sm text-ink-2">
                  <CircleAlert className="mt-0.5 size-4 shrink-0 text-brand-text" strokeWidth={1.5} aria-hidden />
                  <span>
                    Confirma tu correo con el código que te enviamos para poder alquilar y contratar. Mientras
                    tanto puedes explorar Qatu. <TextLink href={ROUTES.verifyEmail}>Confirmar mi correo</TextLink>
                  </span>
                </p>
              )}
              {user.status === "suspended" && (
                <p className="mt-3 text-sm text-destructive">
                  Tu cuenta está suspendida: puedes ver tu historial, pero no hacer nuevas transacciones.
                </p>
              )}
            </section>
            {children}
          </div>
        </Container>
      </main>
    </div>
  );
}
