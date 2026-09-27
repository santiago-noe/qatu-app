import { ROUTES } from "@/lib/session";
import { AuthCard } from "@/features/auth/shared/components/auth-card";
import { TextLink } from "@/features/auth/shared/components/text-link";
import { authErrorMessage } from "@/features/auth/shared/lib/auth-errors";
import { SignupForm } from "./signup-form";

export function SignupView({ error }: { error?: string }) {
  return (
    <AuthCard
      title="Crea tu cuenta"
      description="Es gratis. Alquila herramientas y contrata oficios en Huamanga."
      footer={
        <>
          ¿Ya tienes cuenta? <TextLink href={ROUTES.signin}>Inicia sesión</TextLink>
        </>
      }
    >
      <SignupForm initialAlert={authErrorMessage(error)} />
    </AuthCard>
  );
}
