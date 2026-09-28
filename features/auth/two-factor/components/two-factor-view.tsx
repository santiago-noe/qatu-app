import { AuthCard } from "@/features/auth/shared/components/auth-card";
import { AuthShell } from "@/features/auth/shared/components/auth-shell";
import { LogoutButton } from "@/features/auth/shared/components/logout-button";
import { TwoFactorForm } from "./two-factor-form";

// Segundo paso de los roles internos (soporte, moderación, admin): sin él no entran a sus rutas.
export function TwoFactorView({ email, next }: { email?: string; next: string }) {
  return (
    <AuthShell>
      <AuthCard
        title="Confirma que eres tú"
        description={`Tu cuenta tiene acceso interno a Qatu. Escribe el código de 6 dígitos que enviamos a ${email ?? "tu correo"}.`}
        footer={
          <>
            ¿No es tu cuenta?{" "}
            <LogoutButton className="ml-1 h-9 rounded-[var(--radius-control)] align-middle" />
          </>
        }
      >
        <TwoFactorForm next={next} />
      </AuthCard>
    </AuthShell>
  );
}
