"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { CheckboxField } from "@/components/form/checkbox-field";
import { FormAlert } from "@/components/form/form-alert";
import { TextField } from "@/components/form/text-field";
import { Turnstile, turnstileEnabled, type TurnstileHandle } from "@/components/form/turnstile";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/session";
import { TextLink } from "@/features/auth/shared/components/text-link";
import { useAuthForm } from "@/features/auth/shared/lib/use-auth-form";
import {
  hasErrors,
  PASSWORD_MIN,
  validateEmail,
  validateName,
  validateNewPassword,
} from "@/features/auth/shared/lib/validation";

const FIELDS = ["name", "email", "password", "adult_declared", "accept_legal"] as const;

export function SignupForm() {
  const router = useRouter();
  const { formRef, errors, alert, setAlert, pending, submit } = useAuthForm(FIELDS);
  const turnstile = useRef<TurnstileHandle>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const body = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      adult_declared: form.get("adult_declared") === "on",
      accept_legal: form.get("accept_legal") === "on",
    };
    const clientErrors = {
      name: validateName(body.name),
      email: validateEmail(body.email),
      password: validateNewPassword(body.password),
      adult_declared: body.adult_declared ? undefined : "Debes ser mayor de 18 años para crear una cuenta.",
      accept_legal: body.accept_legal ? undefined : "Acepta los términos y la política de privacidad para continuar.",
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
    <form ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormAlert>{alert}</FormAlert>
      <TextField label="Nombre y apellido" name="name" autoComplete="name" error={errors.name} />
      <TextField label="Correo" name="email" type="email" autoComplete="email" inputMode="email" error={errors.email} />
      <TextField
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="new-password"
        hint={`Mínimo ${PASSWORD_MIN} caracteres. Una frase fácil de recordar es más segura que símbolos raros.`}
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
      <Button type="submit" disabled={pending} className="h-11 rounded-[var(--radius-control)] text-[15px]">
        {pending ? "Creando tu cuenta…" : "Crear cuenta"}
      </Button>
    </form>
  );
}
