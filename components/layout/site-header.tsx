"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHideOnScroll } from "@/hooks/use-hide-on-scroll";
import { useOverlay } from "@/hooks/use-overlay";
import { NAV_LINKS } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/session";
import { AnnouncementBar } from "./announcement-bar";
import { Container } from "./container";
import { Logo } from "./logo";

const HEADER_LINKS = NAV_LINKS.filter((l) => l.inHeader !== false);

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  useOverlay(open, close);
  const [focusWithin, setFocusWithin] = useState(false);
  // Se oculta al bajar y reaparece al subir; queda visible con el menú abierto o con el foco dentro (teclado).
  const hidden = useHideOnScroll({ enabled: !open && !focusWithin });

  return (
    // Alto total: 64 px de cabecera + 32 px de aviso = pt-24 en app/(public)/layout.tsx.
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-transform duration-300 ease-out motion-reduce:transition-none",
        hidden && "-translate-y-full",
      )}
      // Solo el foco de teclado o de escritura la mantiene visible; un clic en un enlace no.
      onFocus={(e) => setFocusWithin((e.target as HTMLElement).matches(":focus-visible"))}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusWithin(false);
      }}
    >
      <div className="border-b border-line bg-bg">
        <Container size="wide" className="flex h-16 items-center gap-4 lg:gap-6">
          <Logo priority />

          <nav aria-label="Principal" className="hidden shrink-0 items-center gap-5 lg:flex">
            {HEADER_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="whitespace-nowrap text-[13px] font-medium text-ink hover:text-brand-text">
                {l.label}
              </a>
            ))}
          </nav>

          {/* Buscador: formulario GET a /buscar, funciona sin JavaScript; ocupa el espacio libre */}
          <form action="/buscar" method="get" role="search" className="hidden min-w-0 flex-1 md:block">
            <label className="mx-auto flex h-9 w-full max-w-2xl items-center gap-2 rounded-[var(--radius-control)] border border-ink-3/40 bg-bg px-4 shadow-sm transition-colors focus-within:border-ink focus-within:ring-1 focus-within:ring-ink">
              <Search className="size-4 shrink-0 text-ink-2" strokeWidth={1.5} aria-hidden />
              <span className="sr-only">Buscar en Qatu</span>
              <input
                type="search"
                name="q"
                placeholder="Busca herramientas o servicios en Huamanga…"
                className="w-full min-w-0 bg-transparent text-sm text-ink outline-none placeholder:text-ink-2 focus-visible:shadow-none focus-visible:outline-none"
              />
            </label>
          </form>

          <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-0">
            <Link href={ROUTES.signin} className="hidden whitespace-nowrap px-2 text-[13px] font-medium text-ink hover:text-brand-text sm:inline">
              Iniciar sesión
            </Link>
            <Button asChild className="hidden h-10 rounded-[var(--radius-control)] px-5 text-[13px] sm:inline-flex">
              <Link href={ROUTES.signin}>Registrarme</Link>
            </Button>
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
        </Container>
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
                <a href={l.href} onClick={close} className="block py-4 text-lg font-medium text-ink">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col gap-3">
            <Button asChild className="h-12 rounded-[var(--radius-control)]">
              <Link href={ROUTES.signin}>Registrarme</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-[var(--radius-control)]">
              <Link href={ROUTES.signin}>Iniciar sesión</Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
