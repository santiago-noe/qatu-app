import { ROUTES } from "@/lib/session";
import { AuthCard } from "@/features/auth/shared/components/auth-card";
import { AuthShell } from "@/features/auth/shared/components/auth-shell";
import { TextLink } from "@/features/auth/shared/components/text-link";
import { authErrorMessage } from "@/features/auth/shared/lib/auth-errors";
import { SIGNUP_SHOWCASE } from "@/features/auth/shared/lib/showcase";
import { SignupForm } from "./signup-form";

export function SignupView({ error }: { error?: string }) {
  return (
    <AuthShell showcase={SIGNUP_SHOWCASE}>
      <AuthCard
        title="Crea tu cuenta"
        description="Es gratis y te toma menos de un minuto. Luego eliges si también ofreces."
        footer={
          <>
            ¿Ya tienes cuenta? <TextLink href={ROUTES.signin}>Inicia sesión</TextLink>
          </>
        }
      >
        <SignupForm initialAlert={authErrorMessage(error)} />
      </AuthCard>
    </AuthShell>
  );
}
