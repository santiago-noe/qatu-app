"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Menú del celular: la misma barra lateral en un <dialog> nativo (atrapa el foco, cierra con Escape).
export function AdminMobileMenu({ children }: { children: React.ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  // Al elegir una sección, el menú se cierra solo.
  useEffect(() => {
    dialog.current?.close();
  }, [pathname]);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-10 rounded-[var(--radius-control)] lg:hidden"
        aria-label="Abrir menú de administración"
        onClick={() => dialog.current?.showModal()}
      >
        <Menu strokeWidth={1.75} aria-hidden />
      </Button>
      <dialog
        ref={dialog}
        aria-label="Menú de administración"
        // Clic en el fondo oscuro (fuera del panel) cierra.
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="m-0 h-dvh max-h-none w-72 max-w-[85vw] bg-bg p-0 backdrop:bg-ink/40 open:animate-in open:slide-in-from-left motion-reduce:open:animate-none"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 z-10"
          aria-label="Cerrar menú"
          onClick={() => dialog.current?.close()}
        >
          <X strokeWidth={1.75} aria-hidden />
        </Button>
        {children}
      </dialog>
    </>
  );
}
