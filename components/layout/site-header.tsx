"use client";

import Link from "next/link";
import { useState } from "react";
import { MapPin, Menu, X } from "lucide-react";
import { NAV_LINKS, PILOT_AREA, CITY } from "@/features/public/landing/lib/content";
import { ROUTES } from "@/lib/session";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-surface/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="bg-inverse-surface px-4 py-1 text-inverse-on-surface">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between text-xs">
          <span className="font-semibold">
            Piloto en {PILOT_AREA}, {CITY}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5 text-tertiary-fixed" aria-hidden />
            {CITY} ({PILOT_AREA})
          </span>
        </div>
      </div>

      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 md:px-6">
        <Link href={ROUTES.home} className="flex items-center gap-2">
          <span className="text-2xl font-extrabold tracking-tight text-primary">
            Qatu
          </span>
          <span className="rounded-full bg-primary-fixed px-2 py-0.5 text-[11px] font-bold text-primary">
            {PILOT_AREA}
          </span>
        </Link>

        <nav
          aria-label="Principal"
          className="hidden items-center gap-5 xl:flex"
        >
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-xs font-semibold text-on-surface-variant transition-colors hover:text-on-surface"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={ROUTES.signin}
            className="hidden rounded-lg px-3 py-2 text-xs font-semibold hover:bg-surface-low sm:inline-flex"
          >
            Iniciar sesión
          </Link>
          <Link
            href={ROUTES.signin}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-on-primary transition-colors hover:bg-primary-container"
          >
            Registrarme
          </Link>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-lg hover:bg-surface-low xl:hidden"
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="menu-movil"
          aria-label="Principal móvil"
          className="border-t border-surface-container bg-surface px-4 py-3 xl:hidden"
        >
          <ul className="flex flex-col">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-3 text-sm font-semibold text-on-surface hover:bg-surface-low"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                href={ROUTES.signin}
                className="block rounded-lg px-3 py-3 text-sm font-semibold text-primary hover:bg-surface-low"
              >
                Iniciar sesión
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
