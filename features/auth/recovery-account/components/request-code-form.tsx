"use client";

import { useRef, useState } from "react";
import { Mail } from "lucide-react";
import { FormAlert } from "@/components/form/form-alert";
import { TextField } from "@/components/form/text-field";
import { Turnstile, type TurnstileHandle } from "@/components/form/turnstile";
import { SubmitButton } from "@/features/auth/shared/components/submit-button";
import { useAuthForm } from "@/features/auth/shared/lib/use-auth-form";
import { validateEmail } from "@/features/auth/shared/lib/validation";

const FIELDS = ["email"] as const;

// Paso 1: pide el código. qatu-api responde igual exista o no la cuenta.
export function RequestCodeForm({ onSent }: { onSent(email: string): void }) {
  const { formRef, errors, alert, pending, submit } = useAuthForm(FIELDS);
  const turnstile = useRef<TurnstileHandle>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    const ok = await submit(
      "/api/auth/password/forgot",
      { email },
      { email: validateEmail(email) },
      { turnstileToken: captchaToken, onServerError: () => turnstile.current?.reset() },
    );
    if (ok) onSent(email);
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
          autoFocus
          error={errors.email}
        />
        <Turnstile ref={turnstile} action="password_forgot" onToken={setCaptchaToken} />
        <SubmitButton pending={pending} label="Enviarme el código" pendingLabel="Enviando…" />
      </form>
    </div>
  );
}
