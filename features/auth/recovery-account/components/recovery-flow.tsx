"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/session";
import { AuthCard } from "@/features/auth/shared/components/auth-card";
import { ActionArrow, PRIMARY_ACTION } from "@/features/auth/shared/components/submit-button";
import { TextLink } from "@/features/auth/shared/components/text-link";
import { RequestCodeForm } from "./request-code-form";
import { ResetPasswordForm } from "./reset-password-form";

type Step = { name: "request" } | { name: "reset"; email: string } | { name: "done" };

const backToSignin = (
  <>
    ¿Recordaste tu contraseña? <TextLink href={ROUTES.signin}>Inicia sesión</TextLink>
  </>
);

// Recuperar la contraseña en tres pasos: correo, código con la contraseña nueva y listo.
// Los mensajes nunca confirman si el correo tiene cuenta.
export function RecoveryFlow() {
  const [step, setStep] = useState<Step>({ name: "request" });

  if (step.name === "reset") {
    return (
      <AuthCard
        title="Crea una contraseña nueva"
        description={`Si ${step.email} tiene una cuenta en Qatu, te enviamos un código de 6 dígitos.`}
        footer={backToSignin}
      >
        <ResetPasswordForm
          email={step.email}
          onDone={() => setStep({ name: "done" })}
          onRestart={() => setStep({ name: "request" })}
        />
      </AuthCard>
    );
  }

  if (step.name === "done") {
    return (
      <AuthCard
        title="Tu contraseña cambió"
        description="Por seguridad cerramos tu sesión en todos tus dispositivos. Entra con tu contraseña nueva."
      >
        <Button asChild className={`w-full ${PRIMARY_ACTION}`}>
          <Link href={ROUTES.signin}>
            Iniciar sesión
            <ActionArrow />
          </Link>
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Recupera tu cuenta"
      description="Escribe el correo con el que te registraste y te enviaremos un código para crear una contraseña nueva."
      footer={backToSignin}
    >
      <RequestCodeForm onSent={(email) => setStep({ name: "reset", email })} />
    </AuthCard>
  );
}
