"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { ApiError } from "@/lib/api";
import { callBff } from "@/lib/bff-client";

// qatu-api envía como máximo un código por minuto a cada cuenta (OneTimeCodes).
const RESEND_SECONDS = 60;

interface ResendCodeProps {
  /** Ruta del BFF que envía el código (correo o segundo paso). */
  path: string;
  /** Envía el primer código al abrir la pantalla: iniciar sesión no lo envía (segundo paso). */
  sendOnMount?: boolean;
  /** Se llama al reenviar con el botón (el envío automático no se anuncia). */
  onSent(): void;
  onError(error: ApiError): void;
}

// Botón "Reenviar código" con espera de un minuto entre envíos.
export function ResendCode({ path, sendOnMount = false, onSent, onError }: ResendCodeProps) {
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);
  const sentOnMount = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const send = useEffectEvent(async (manual: boolean) => {
    setSending(true);
    const result = await callBff(path, { body: {} });
    setSending(false);
    if (result.ok) {
      setCooldown(RESEND_SECONDS);
      if (manual) onSent();
      return;
    }
    // Ya hay un código enviado hace menos de un minuto: al recargar la página no es un error.
    if (result.error.error === "demasiados_intentos") {
      setCooldown(RESEND_SECONDS);
      if (!manual) return;
    }
    onError(result.error);
  });

  useEffect(() => {
    // La guarda evita el doble envío del modo estricto de React en desarrollo.
    if (!sendOnMount || sentOnMount.current) return;
    sentOnMount.current = true;
    send(false);
  }, [sendOnMount]);

  const waiting = cooldown > 0;
  return (
    <button
      type="button"
      onClick={() => send(true)}
      disabled={sending || waiting}
      className="text-sm font-medium text-brand-text underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-ink-3 disabled:no-underline"
    >
      {sending ? "Enviando…" : waiting ? `Reenviar código en ${cooldown} s` : "Reenviar código"}
    </button>
  );
}
