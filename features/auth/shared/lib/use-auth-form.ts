"use client";

import { useEffect, useRef, useState } from "react";
import { callBff } from "@/lib/bff-client";
import { fieldForError } from "./field-errors";
import { hasErrors, type FieldErrors } from "./validation";

interface SubmitOptions {
  turnstileToken?: string | null;
  /** Se llama si la petición llegó al servidor y falló (por ejemplo, para pedir otro captcha). */
  onServerError?: () => void;
}

/**
 * Estado común de los formularios de acceso: errores por campo, aviso general y envío.
 * submit valida en el navegador, llama al BFF y reparte los errores de qatu-api en sus campos.
 */
export function useAuthForm<F extends string>(fields: readonly F[], initialAlert?: string) {
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<FieldErrors<F>>({});
  // initialAlert: error con el que se vuelve de Google (?error=).
  const [alert, setAlert] = useState(initialAlert);
  const [pending, setPending] = useState(false);

  // Tras un error, el foco va al primer campo inválido (lectores de pantalla y teclado).
  useEffect(() => {
    formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
  }, [errors]);

  async function submit<T>(path: string, body: unknown, clientErrors: FieldErrors<F>, opts: SubmitOptions = {}) {
    setAlert(undefined);
    setErrors(clientErrors);
    if (hasErrors(clientErrors)) return undefined;

    setPending(true);
    const result = await callBff<T>(path, { body, turnstileToken: opts.turnstileToken });
    if (result.ok) return result.data; // sigue "pendiente" mientras la página navega

    setPending(false);
    opts.onServerError?.();
    const field = fieldForError(result.error.error, fields);
    if (field) setErrors({ [field]: result.error.message } as FieldErrors<F>);
    else setAlert(result.error.message);
    return undefined;
  }

  return { formRef, errors, setErrors, alert, setAlert, pending, submit };
}
