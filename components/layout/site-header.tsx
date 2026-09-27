"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { HEADER_LINKS, NAV_LINKS } from "@/features/public/landing/lib/content";
import { ROUTES } from "@/lib/session";
import { AnnouncementBar } from "./announcement-bar";
import { Logo } from "./logo";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  // El menú móvil bloquea el scroll del fondo y se cierra con Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="border-b border-line bg-bg">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-6 px-4 md:px-12">
          <Logo priority />

          <nav aria-label="Principal" className="hidden items-center gap-6 lg:flex">
            {HEADER_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-ink hover:text-accent">
                {l.label}
              </a>
            ))}
          </nav>

          {/* Buscador compacto: formulario GET a /buscar, funciona sin JavaScript */}
          <form action="/buscar" method="get" role="search" className="ml-auto hidden md:block">
            <label className="flex h-9 w-56 items-center gap-2 rounded-[var(--radius-control)] bg-bg-soft px-3 lg:w-64">
              <Search className="size-4 shrink-0 text-ink-3" strokeWidth={1.5} aria-hidden />
              <span className="sr-only">Buscar en Qatu</span>
              <input
                type="search"
                name="q"
                placeholder="¿Qué necesitas?"
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
              />
            </label>
          </form>

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <p className="hidden text-sm text-ink sm:block">
              <Link href={ROUTES.signin} className="hover:text-accent">
                Iniciar sesión
              </Link>
              <span className="px-1 text-ink-3" aria-hidden>
                /
              </span>
              <Link href={ROUTES.signin} className="hover:text-accent">
                Registrarme
              </Link>
            </p>
            <a
              href="/#buscar"
              aria-label="Buscar"
              className="inline-flex size-11 items-center justify-center text-ink md:hidden"
            >
              <Search className="size-5" strokeWidth={1.5} />
            </a>
            <button
              type="button"
              className="-mr-2 inline-flex size-11 items-center justify-center text-ink lg:hidden"
              aria-expanded={open}
              aria-controls="menu-movil"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-6" strokeWidth={1.5} /> : <Menu className="size-6" strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </div>

      <AnnouncementBar />

      {open && (
        <nav
          id="menu-movil"
          aria-label="Principal móvil"
          className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto bg-bg px-4 pb-10 pt-4 lg:hidden"
        >
          <ul className="divide-y divide-line border-y border-line">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={`/${l.href}`}
                  onClick={() => setOpen(false)}
                  className="block py-4 text-lg text-ink"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href={ROUTES.signin}
              className="inline-flex h-12 items-center justify-center rounded-[var(--radius-control)] bg-ink text-sm font-medium text-white"
            >
              Registrarme
            </Link>
            <Link
              href={ROUTES.signin}
              className="inline-flex h-12 items-center justify-center rounded-[var(--radius-control)] border border-ink text-sm font-medium text-ink"
            >
              Iniciar sesión
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
