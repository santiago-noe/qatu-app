import { CircleAlert, CircleCheck } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
import type { ApiUser } from "@/lib/api";
import { LogoutButton } from "@/features/auth/shared/components/logout-button";

// Panel inicial: confirma la cuenta y su estado. Las secciones (alquileres, servicios,
// mensajes…) se suman con sus features.
export function DashboardView({ user }: { user: ApiUser }) {
  const firstName = user.name.split(" ")[0];

  return (
    <div className="min-h-screen bg-bg-soft">
      <header className="border-b border-line bg-bg">
        <Container size="wide" className="flex h-16 items-center justify-between gap-4">
          <Logo priority />
          <LogoutButton className="h-10 rounded-[var(--radius-control)]" />
        </Container>
      </header>

      <main>
        <Container className="py-10 sm:py-14">
          <p className="eyebrow">Mi panel</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Hola, {firstName}</h1>
          <p className="mt-2 text-ink-2">{user.email}</p>

          <section
            aria-labelledby="estado-cuenta"
            className="mt-8 max-w-xl rounded-[var(--radius-card)] border border-line bg-bg p-5"
          >
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
                Confirma tu correo con el código que te enviamos para poder alquilar y contratar. Mientras
                tanto puedes explorar Qatu.
              </p>
            )}
            {user.status === "suspended" && (
              <p className="mt-3 text-sm text-destructive">
                Tu cuenta está suspendida: puedes ver tu historial, pero no hacer nuevas transacciones.
              </p>
            )}
          </section>
        </Container>
      </main>
    </div>
  );
}
