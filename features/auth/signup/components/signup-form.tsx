"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { KeyRound, Mail, UserRound } from "lucide-react";
import { CheckboxField } from "@/components/form/checkbox-field";
import { FormAlert } from "@/components/form/form-alert";
import { TextField } from "@/components/form/text-field";
import { Turnstile, turnstileEnabled, type TurnstileHandle } from "@/components/form/turnstile";
import { ROUTES } from "@/lib/session";
import { AuthDivider, GoogleButton, type GoogleConsents } from "@/features/auth/shared/components/google-button";
import { PrivacyNote } from "@/features/auth/shared/components/privacy-note";
import { SubmitButton } from "@/features/auth/shared/components/submit-button";
import { TextLink } from "@/features/auth/shared/components/text-link";
import { useAuthForm } from "@/features/auth/shared/lib/use-auth-form";
import {
  hasErrors,
  PASSWORD_MIN,
  validateConsents,
  validateEmail,
  validateName,
  validateNewPassword,
} from "@/features/auth/shared/lib/validation";

const FIELDS = ["name", "email", "password", "adult_declared", "accept_legal"] as const;

const checked = (form: FormData, name: string) => form.get(name) === "on";

export function SignupForm({ initialAlert }: { initialAlert?: string }) {
  const router = useRouter();
  const { formRef, errors, setErrors, alert, setAlert, pending, submit } = useAuthForm(FIELDS, initialAlert);
  const turnstile = useRef<TurnstileHandle>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // Con Google solo hacen falta las casillas: nombre y correo los confirma Google.
  function googleConsents(): GoogleConsents | null {
    const form = new FormData(formRef.current ?? undefined);
    const consentErrors = validateConsents(checked(form, "adult_declared"), checked(form, "accept_legal"));
    setAlert(undefined);
    setErrors(consentErrors);
    return hasErrors(consentErrors) ? null : { adult_declared: true, accept_legal: true };
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const body = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      adult_declared: checked(form, "adult_declared"),
      accept_legal: checked(form, "accept_legal"),
    };
    const clientErrors = {
      name: validateName(body.name),
      email: validateEmail(body.email),
      password: validateNewPassword(body.password),
      ...validateConsents(body.adult_declared, body.accept_legal),
    };
    if (turnstileEnabled && !captchaToken && !hasErrors(clientErrors)) {
      setAlert("Completa la verificación de seguridad para continuar.");
      return;
    }

    const ok = await submit("/api/auth/register", body, clientErrors, {
      // El token de Turnstile sirve una vez: tras un rechazo se pide otro.
      turnstileToken: captchaToken,
      onServerError: () => turnstile.current?.reset(),
    });
    if (ok) {
      router.replace(ROUTES.dashboard);
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <FormAlert>{alert}</FormAlert>
      <form ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-col gap-3.5">
        <TextField
          label="Nombre y apellido"
          icon={UserRound}
          name="name"
          autoComplete="name"
          placeholder="Ej. Rosa Quispe"
          error={errors.name}
        />
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
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder={`Mínimo ${PASSWORD_MIN} caracteres`}
          hint="Mejor una frase fácil de recordar que símbolos raros."
          error={errors.password}
        />
        <CheckboxField name="adult_declared" error={errors.adult_declared}>
          Declaro que soy mayor de 18 años.
        </CheckboxField>
        <CheckboxField name="accept_legal" error={errors.accept_legal}>
          Acepto los{" "}
          <TextLink href={ROUTES.terms} target="_blank">
            Términos y condiciones
          </TextLink>{" "}
          y la{" "}
          <TextLink href={ROUTES.privacy} target="_blank">
            Política de privacidad
          </TextLink>
          .
        </CheckboxField>
        <Turnstile ref={turnstile} action="register" onToken={setCaptchaToken} />
        <SubmitButton pending={pending} label="Crear mi cuenta" pendingLabel="Creando tu cuenta…" />
      </form>
      <AuthDivider label="o regístrate con" />
      {/* Usa las mismas casillas de arriba; si faltan, el foco sube a ellas con su mensaje. */}
      <GoogleButton from="signup" getConsents={googleConsents} onError={setAlert} />
      <PrivacyNote />
    </div>
  );
}
