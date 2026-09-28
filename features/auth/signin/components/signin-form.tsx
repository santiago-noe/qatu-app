"use client";

import { useRouter } from "next/navigation";
import { KeyRound, Mail } from "lucide-react";
import { FormAlert } from "@/components/form/form-alert";
import { TextField } from "@/components/form/text-field";
import type { ApiAuthResponse } from "@/lib/api";
import { ROUTES, safeNextPath, withNext } from "@/lib/session";
import { AuthDivider, GoogleButton } from "@/features/auth/shared/components/google-button";
import { PrivacyNote } from "@/features/auth/shared/components/privacy-note";
import { SubmitButton } from "@/features/auth/shared/components/submit-button";
import { TextLink } from "@/features/auth/shared/components/text-link";
import { useAuthForm } from "@/features/auth/shared/lib/use-auth-form";
import { validateCurrentPassword, validateEmail } from "@/features/auth/shared/lib/validation";

const FIELDS = ["email", "password"] as const;

interface SigninFormProps {
  next?: string;
  /** Mensaje con el que se vuelve de Google, si algo falló. */
  initialAlert?: string;
}

export function SigninForm({ next, initialAlert }: SigninFormProps) {
  const router = useRouter();
  const { formRef, errors, alert, setAlert, pending, submit } = useAuthForm(FIELDS, initialAlert);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    const ok = await submit<Omit<ApiAuthResponse, "session">>(
      "/api/auth/login",
      { email, password },
      { email: validateEmail(email), password: validateCurrentPassword(password) },
    );
    if (ok) {
      // Roles internos: el código del segundo paso antes de seguir al destino.
      const target = safeNextPath(next);
      router.replace(ok.data.two_factor_required ? withNext(ROUTES.twoFactor, target) : target);
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <FormAlert>{alert}</FormAlert>
      <form ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <TextField
          label="Correo electrónico"
          icon={Mail}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="ejemplo@correo.pe"
          error={errors.email}
        />
        <TextField
          label="Contraseña"
          icon={KeyRound}
          action={<TextLink href={ROUTES.recovery}>¿Olvidaste tu contraseña?</TextLink>}
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Ingresa tu contraseña"
          error={errors.password}
        />
        <SubmitButton pending={pending} label="Iniciar sesión en Qatu" pendingLabel="Ingresando…" />
      </form>
      <AuthDivider label="o continúa con" />
      <GoogleButton from="signin" next={next} onError={setAlert} />
      <PrivacyNote />
    </div>
  );
}
