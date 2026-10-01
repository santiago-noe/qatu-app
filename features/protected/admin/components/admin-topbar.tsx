"use client";

import Form from "next/form";
import { usePathname } from "next/navigation";
import { ChevronRight, Search } from "lucide-react";
import { locateSection, type StaffRole } from "@/features/protected/admin/lib/admin-nav";
import { AdminMobileMenu } from "./admin-mobile-menu";
import { UserAvatar } from "./user-avatar";

interface AdminTopbarProps {
  name: string;
  roles: StaffRole[];
  /** Barra lateral para el menú del celular. */
  menu: React.ReactNode;
}

// Barra superior del panel: dónde estás, buscar una cuenta por correo y quién eres.
export function AdminTopbar({ name, roles, menu }: AdminTopbarProps) {
  const isAdmin = roles.includes("admin");
  const { group, section } = locateSection(usePathname());

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/95 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <AdminMobileMenu>{menu}</AdminMobileMenu>

        <p className="hidden min-w-0 items-center gap-1.5 text-sm text-ink-3 sm:flex">
          <span>Administración</span>
          {group && (
            <>
              <ChevronRight className="size-3.5" aria-hidden />
              <span>{group}</span>
            </>
          )}
          {section && (
            <>
              <ChevronRight className="size-3.5" aria-hidden />
              <span className="font-medium text-ink">{section.label}</span>
            </>
          )}
        </p>

        {/* next/form: navega sin recargar a Usuarios, que busca el correo al abrir. Solo admin. */}
        {!isAdmin && <span className="ml-auto" />}
        {isAdmin && (
        <Form action="/admin/usuarios" role="search" aria-label="Búsqueda rápida" className="ml-auto w-full max-w-xs">
          <label className="relative block">
            <span className="sr-only">Buscar una cuenta por correo</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3"
              strokeWidth={1.75}
              aria-hidden
            />
            <input
              name="email"
              type="email"
              inputMode="email"
              autoComplete="off"
              placeholder="Buscar cuenta por correo…"
              className="h-10 w-full rounded-full border border-line bg-bg-soft pl-9 pr-3 text-sm text-ink placeholder:text-ink-3 focus-visible:border-ink focus-visible:bg-bg"
            />
          </label>
        </Form>
        )}

        <div className="flex shrink-0 items-center gap-2.5">
          <UserAvatar name={name} />
          <div className="hidden leading-tight md:block">
            <p className="text-sm font-medium text-ink">{name}</p>
            <p className="text-xs text-ink-3">{isAdmin ? "Administrador" : "Moderador"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
