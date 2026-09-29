"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { callBff } from "@/lib/bff-client";

interface ActionOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH";
  body?: unknown;
  /** Texto del aviso si sale bien ("Guardado."). */
  success?: string;
  /** Vuelve a leer los datos de la página (Server Components). Por defecto, en toda escritura. */
  refresh?: boolean;
}

/**
 * Llamadas del panel admin a /api/admin/*: estado de envío, aviso de error o de éxito y, tras
 * escribir, router.refresh() para que la página muestre lo guardado (y la caché del catálogo ya limpia).
 * run devuelve el resultado ({ok, data} o {ok, error}): un formulario puede llevar el error a su campo.
 */
export function useAdminAction() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [alert, setAlert] = useState<string>();
  const [notice, setNotice] = useState<string>();

  async function run<T>(path: string, opts: ActionOptions = {}) {
    setPending(true);
    setAlert(undefined);
    setNotice(undefined);
    const result = await callBff<T>(`/api/admin${path}`, { method: opts.method, body: opts.body });
    setPending(false);
    if (!result.ok) {
      setAlert(result.error.message);
      return result;
    }
    if (opts.success) setNotice(opts.success);
    if (opts.refresh ?? (opts.method !== undefined && opts.method !== "GET")) router.refresh();
    return result;
  }

  return { run, pending, alert, notice, setAlert, setNotice };
}
