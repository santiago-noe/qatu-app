"use client";

import Script from "next/script";
import { useEffect, useImperativeHandle, useRef, useState } from "react";

// Clave pública del sitio. Sin ella (desarrollo) el widget no se muestra y qatu-api, sin
// secreto, tampoco lo exige. Claves de prueba de Cloudflare: 1x00000000000000000000AA (pasa).
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export const turnstileEnabled = Boolean(SITE_KEY);

interface TurnstileApi {
  render(el: HTMLElement, options: Record<string, unknown>): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export interface TurnstileHandle {
  /** Pide un token nuevo: cada token sirve una sola vez, también si el envío falló. */
  reset(): void;
}

interface TurnstileProps {
  /** Nombre del formulario; qatu-api comprueba que coincida (register, password_forgot). */
  action: string;
  onToken(token: string | null): void;
  ref?: React.Ref<TurnstileHandle>;
}

// Widget de Cloudflare Turnstile. El token viaja al BFF en la cabecera X-Turnstile-Token.
export function Turnstile({ action, onToken, ref }: TurnstileProps) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onTokenRef.current = onToken;
  });

  useImperativeHandle(ref, () => ({
    reset() {
      if (widgetId.current) window.turnstile?.reset(widgetId.current);
      onTokenRef.current(null);
    },
  }));

  useEffect(() => {
    if (!SITE_KEY || !ready || !container.current || !window.turnstile) return;
    const id = window.turnstile.render(container.current, {
      sitekey: SITE_KEY,
      action,
      language: "es",
      theme: "light",
      callback: (token: string) => onTokenRef.current(token),
      "expired-callback": () => onTokenRef.current(null),
      "error-callback": () => onTokenRef.current(null),
    });
    widgetId.current = id;
    return () => {
      window.turnstile?.remove(id);
      widgetId.current = null;
    };
  }, [ready, action]);

  if (!SITE_KEY) return null;
  return (
    <>
      <Script src={SCRIPT_SRC} strategy="afterInteractive" onReady={() => setReady(true)} />
      {/* Alto reservado del widget para que el formulario no salte al cargarlo */}
      <div ref={container} className="min-h-[65px]" />
    </>
  );
}
