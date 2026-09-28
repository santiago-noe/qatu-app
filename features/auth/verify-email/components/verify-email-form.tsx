"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormAlert, FormNotice } from "@/components/form/form-alert";
import { ROUTES } from "@/lib/session";
import { CodeField } from "@/features/auth/shared/components/code-field";
import { ResendCode } from "@/features/auth/shared/components/resend-code";
import { SubmitButton } from "@/features/auth/shared/components/submit-button";
import { useAuthForm } from "@/features/auth/shared/lib/use-auth-form";
import { normalizeCode, validateCode } from "@/features/auth/shared/lib/validation";

const FIELDS = ["code"] as const;

// El registro ya envió el primer código; aquí se confirma o se pide otro.
export function VerifyEmailForm() {
  const router = useRouter();
  const { formRef, errors, alert, setAlert, pending, submit } = useAuthForm(FIELDS);
  const [notice, setNotice] = useState<string>();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotice(undefined);
    const code = String(new FormData(e.currentTarget).get("code") ?? "");
    const ok = await submit("/api/auth/email/verify", { code: normalizeCode(code) }, { code: validateCode(code) });
    if (ok) {
      router.replace(ROUTES.dashboard);
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <FormAlert>{alert}</FormAlert>
      <FormNotice>{notice}</FormNotice>
      <form ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <CodeField error={errors.code} autoFocus />
        <SubmitButton pending={pending} label="Confirmar mi correo" pendingLabel="Confirmando…" />
      </form>
      <p className="text-center text-sm text-ink-2">
        ¿No te llegó?{" "}
        <ResendCode
          path="/api/auth/email/resend"
          onSent={() => {
            setAlert(undefined);
            setNotice("Te enviamos un código nuevo. El anterior ya no sirve.");
          }}
          onError={(error) => {
            setNotice(undefined);
            setAlert(error.message);
          }}
        />
      </p>
    </div>
  );
}
