"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS, PILOT_AREA } from "@/features/public/landing/lib/content";
import { ROUTES } from "@/lib/session";

// Pestañas principales del centro; el resto vive en el menú móvil.
const CENTER_LINKS = NAV_LINKS.slice(0, 3);

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 md:px-8">
        <Link href={ROUTES.home} className="flex items-center gap-2" aria-label="Qatu, inicio">
          <span className="text-2xl font-extrabold tracking-tight text-primary">
            Qatu
          </span>
          <span className="hidden rounded-full bg-primary-fixed px-2 py-0.5 text-[11px] font-bold text-primary sm:inline">
            {PILOT_AREA}
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
          {CENTER_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <a
            href="#ofrece-en-qatu"
            className="hidden rounded-full px-4 py-2 text-sm font-semibold hover:bg-surface-container md:inline-flex"
          >
            Ofrece en Qatu
          </a>
          <Link
            href={ROUTES.signin}
            className="hidden rounded-full px-4 py-2 text-sm font-semibold hover:bg-surface-container sm:inline-flex"
          >
            Iniciar sesión
          </Link>
          <Link
            href={ROUTES.signin}
            className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-container"
          >
            Registrarme
          </Link>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full hover:bg-surface-container lg:hidden"
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
          className="border-t border-border bg-surface px-4 py-3 lg:hidden"
        >
          <ul className="flex flex-col">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-3 text-sm font-semibold hover:bg-surface-container"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                href={ROUTES.signin}
                className="block rounded-xl px-3 py-3 text-sm font-semibold text-primary hover:bg-surface-container"
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
