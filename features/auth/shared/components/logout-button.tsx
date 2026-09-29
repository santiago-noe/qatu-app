"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/session";
import { callBff } from "@/lib/bff-client";

interface LogoutButtonProps {
  className?: string;
  /** Clases del texto: "max-sm:sr-only" deja solo el ícono en el celular (el lector lo sigue leyendo). */
  labelClassName?: string;
}

// Cierra la sesión en este dispositivo. El BFF borra la cookie aunque el API no responda.
export function LogoutButton({ className, labelClassName }: LogoutButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    await callBff("/api/auth/logout", { method: "POST" });
    router.replace(ROUTES.home);
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={logout}
      disabled={pending}
      className={className ?? "h-11 rounded-[var(--radius-control)]"}
    >
      <LogOut strokeWidth={1.5} aria-hidden />
      <span className={labelClassName}>{pending ? "Cerrando sesión…" : "Cerrar sesión"}</span>
    </Button>
  );
}
