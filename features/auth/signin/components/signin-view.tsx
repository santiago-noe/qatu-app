import { ROUTES } from "@/lib/session";
import { AuthCard } from "@/features/auth/shared/components/auth-card";
import { AuthShell } from "@/features/auth/shared/components/auth-shell";
import { TextLink } from "@/features/auth/shared/components/text-link";
import { authErrorMessage } from "@/features/auth/shared/lib/auth-errors";
import { SIGNIN_SHOWCASE } from "@/features/auth/shared/lib/showcase";
import { SigninForm } from "./signin-form";

export function SigninView({ next, error }: { next?: string; error?: string }) {
  return (
    <AuthShell showcase={SIGNIN_SHOWCASE}>
      <AuthCard
        title="Bienvenido de vuelta a Qatu"
        description="Entra para alquilar, contratar y seguir tus solicitudes."
        footer={
          <>
            ¿Aún no tienes cuenta en Qatu? <TextLink href={ROUTES.signup}>Regístrate gratis</TextLink>
          </>
        }
      >
        <SigninForm next={next} initialAlert={authErrorMessage(error)} />
      </AuthCard>
    </AuthShell>
  );
}
