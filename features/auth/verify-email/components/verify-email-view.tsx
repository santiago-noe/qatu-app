import { ROUTES } from "@/lib/session";
import { AuthCard } from "@/features/auth/shared/components/auth-card";
import { AuthShell } from "@/features/auth/shared/components/auth-shell";
import { TextLink } from "@/features/auth/shared/components/text-link";
import { VerifyEmailForm } from "./verify-email-form";

export function VerifyEmailView({ email }: { email?: string }) {
  return (
    <AuthShell>
      <AuthCard
        title="Confirma tu correo"
        description={`Escribe el código de 6 dígitos que enviamos a ${email ?? "tu correo"}. Lo necesitas para alquilar y contratar.`}
        footer={
          <>
            ¿Prefieres hacerlo después? <TextLink href={ROUTES.dashboard}>Ir a mi panel</TextLink>
          </>
        }
      >
        <VerifyEmailForm />
      </AuthCard>
    </AuthShell>
  );
}
