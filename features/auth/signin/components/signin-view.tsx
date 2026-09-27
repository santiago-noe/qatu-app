import { ROUTES } from "@/lib/session";
import { AuthCard } from "@/features/auth/shared/components/auth-card";
import { TextLink } from "@/features/auth/shared/components/text-link";
import { authErrorMessage } from "@/features/auth/shared/lib/auth-errors";
import { SigninForm } from "./signin-form";

export function SigninView({ next, error }: { next?: string; error?: string }) {
  return (
    <AuthCard
      title="Inicia sesión"
      description="Entra para alquilar, contratar y seguir tus solicitudes."
      footer={
        <>
          ¿No tienes cuenta? <TextLink href={ROUTES.signup}>Regístrate gratis</TextLink>
        </>
      }
    >
      <SigninForm next={next} initialAlert={authErrorMessage(error)} />
    </AuthCard>
  );
}
