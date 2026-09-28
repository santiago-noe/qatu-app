"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormAlert, FormNotice } from "@/components/form/form-alert";
import type { ApiError } from "@/lib/api";
import { CodeField } from "@/features/auth/shared/components/code-field";
import { ResendCode } from "@/features/auth/shared/components/resend-code";
import { SubmitButton } from "@/features/auth/shared/components/submit-button";
import { useAuthForm } from "@/features/auth/shared/lib/use-auth-form";
import { normalizeCode, validateCode } from "@/features/auth/shared/lib/validation";

const FIELDS = ["code"] as const;

// Iniciar sesión no envía el código: se envía al abrir esta pantalla.
export function TwoFactorForm({ next }: { next: string }) {
  const router = useRouter();
  const { formRef, errors, alert, setAlert, pending, submit } = useAuthForm(FIELDS);
  const [notice, setNotice] = useState<string>();

  function goNext() {
    router.replace(next);
    router.refresh();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotice(undefined);
    const code = String(new FormData(e.currentTarget).get("code") ?? "");
    const ok = await submit("/api/auth/two-factor/verify", { code: normalizeCode(code) }, { code: validateCode(code) });
    if (ok) goNext();
  }

  function onSendError(error: ApiError) {
    // La sesión ya pasó el segundo paso (o no lo necesita): no hay nada que confirmar.
    if (error.error === "dos_pasos_no_pendiente") return goNext();
    setNotice(undefined);
    setAlert(error.message);
  }

  return (
    <div className="flex flex-col gap-4">
      <FormAlert>{alert}</FormAlert>
      <FormNotice>{notice}</FormNotice>
      <form ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <CodeField error={errors.code} autoFocus />
        <SubmitButton pending={pending} label="Continuar" pendingLabel="Comprobando…" />
      </form>
      <p className="text-center text-sm text-ink-2">
        ¿No te llegó?{" "}
        <ResendCode
          path="/api/auth/two-factor/send"
          sendOnMount
          onSent={() => {
            setAlert(undefined);
            setNotice("Te enviamos un código nuevo. El anterior ya no sirve.");
          }}
          onError={onSendError}
        />
      </p>
    </div>
  );
}
