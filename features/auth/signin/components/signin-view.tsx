import { ROUTES } from "@/lib/session";
import { AuthCard } from "@/features/auth/shared/components/auth-card";
import { TextLink } from "@/features/auth/shared/components/text-link";
import { SigninForm } from "./signin-form";

export function SigninView({ next }: { next?: string }) {
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
      <SigninForm next={next} />
    </AuthCard>
  );
}
