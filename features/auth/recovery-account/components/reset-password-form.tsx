"use client";

import { FormAlert } from "@/components/form/form-alert";
import { CodeField } from "@/features/auth/shared/components/code-field";
import { NewPasswordField } from "@/features/auth/shared/components/new-password-field";
import { SubmitButton } from "@/features/auth/shared/components/submit-button";
import { useAuthForm } from "@/features/auth/shared/lib/use-auth-form";
import { normalizeCode, validateCode, validateNewPassword } from "@/features/auth/shared/lib/validation";

const FIELDS = ["code", "password"] as const;

interface ResetPasswordFormProps {
  email: string;
  onDone(): void;
  /** Volver al paso 1: otro correo, o pedir un código nuevo (necesita otra verificación de seguridad). */
  onRestart(): void;
}

// Paso 2: código del correo y contraseña nueva.
export function ResetPasswordForm({ email, onDone, onRestart }: ResetPasswordFormProps) {
  const { formRef, errors, alert, pending, submit } = useAuthForm(FIELDS);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const code = String(form.get("code") ?? "");
    const password = String(form.get("password") ?? "");
    const ok = await submit(
      "/api/auth/password/reset",
      { email, code: normalizeCode(code), password },
      { code: validateCode(code), password: validateNewPassword(password) },
    );
    if (ok) onDone();
  }

  return (
    <div className="flex flex-col gap-4">
      <FormAlert>{alert}</FormAlert>
      <form ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {/* Para que el gestor de contraseñas guarde la nueva con el correo correcto. */}
        <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
        <CodeField error={errors.code} autoFocus />
        <NewPasswordField label="Contraseña nueva" error={errors.password} />
        <SubmitButton pending={pending} label="Guardar contraseña" pendingLabel="Guardando…" />
      </form>
      <p className="text-center text-sm text-ink-2">
        ¿No te llegó o te equivocaste de correo?{" "}
        <button
          type="button"
          onClick={onRestart}
          className="font-medium text-brand-text underline-offset-4 hover:underline"
        >
          Pedir otro código
        </button>
      </p>
    </div>
  );
}
