"use client";

import { useRouter } from "next/navigation";
import { FormAlert } from "@/components/form/form-alert";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import { ROUTES, safeNextPath } from "@/lib/session";
import { AuthDivider, GoogleButton } from "@/features/auth/shared/components/google-button";
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

    const ok = await submit(
      "/api/auth/login",
      { email, password },
      { email: validateEmail(email), password: validateCurrentPassword(password) },
    );
    if (ok) {
      router.replace(safeNextPath(next));
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <FormAlert>{alert}</FormAlert>
      <GoogleButton from="signin" next={next} onError={setAlert} />
      <AuthDivider label="o con tu correo" />
      <form ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <TextField label="Correo" name="email" type="email" autoComplete="email" inputMode="email" error={errors.email} />
        <TextField
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="current-password"
          error={errors.password}
        />
        <div className="-mt-1 flex justify-end text-sm">
          <TextLink href={ROUTES.recovery}>¿Olvidaste tu contraseña?</TextLink>
        </div>
        <Button type="submit" disabled={pending} className="h-11 rounded-[var(--radius-control)] text-[15px]">
          {pending ? "Ingresando…" : "Iniciar sesión"}
        </Button>
      </form>
    </div>
  );
}
