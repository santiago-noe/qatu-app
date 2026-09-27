"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CITY, NAV_LINKS, PILOT_AREA } from "@/features/public/landing/lib/content";
import { ROUTES } from "@/lib/session";

// Enlaces principales del centro; el resto vive en la hoja móvil.
const CENTER_LINKS = NAV_LINKS.slice(0, 3);

const textLink =
  "text-[15px] text-ink underline-offset-4 decoration-1 hover:underline";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Transparente sobre el hero; con fondo y borde al hacer scroll.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // La hoja móvil bloquea el scroll del fondo y se cierra con Escape.
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
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-200",
        scrolled || open ? "border-line bg-bg" : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-6 px-6 md:px-12">
        <div className="flex items-center gap-10">
          <Link href={ROUTES.home} className="flex items-baseline gap-3" aria-label="Qatu, inicio">
            <span className="text-2xl font-medium tracking-[-0.03em] text-ink">Qatu</span>
            <span className="label-mono hidden text-ink-3 sm:inline">
              {CITY} · {PILOT_AREA}
            </span>
          </Link>

          <nav aria-label="Principal" className="hidden items-center gap-7 lg:flex">
            {CENTER_LINKS.map((l) => (
              <a key={l.href} href={l.href} className={textLink}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <a href="#ofrece-en-qatu" className={cn(textLink, "hidden md:inline")}>
            Ofrece en Qatu
          </a>
          <Link href={ROUTES.signin} className={cn(textLink, "hidden sm:inline")}>
            Iniciar sesión
          </Link>
          <Link
            href={ROUTES.signin}
            className="hidden h-10 items-center rounded-[var(--radius-control)] bg-accent px-5 text-[15px] font-medium text-white transition-colors hover:bg-accent-hover sm:inline-flex"
          >
            Registrarme
          </Link>
          <button
            type="button"
            className="-mr-2 inline-flex size-11 items-center justify-center rounded-[var(--radius-control)] text-ink lg:hidden"
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-6" strokeWidth={1.5} /> : <Menu className="size-6" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="menu-movil"
          aria-label="Principal móvil"
          className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto bg-bg px-6 pb-10 pt-6 lg:hidden"
        >
          <p className="label-mono mb-6 text-ink-3">
            {CITY} · {PILOT_AREA}
          </p>
          <ul className="divide-y divide-line border-y border-line">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-4 text-2xl font-normal tracking-[-0.01em] text-ink"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href={ROUTES.signin}
              className="inline-flex h-12 items-center justify-center rounded-[var(--radius-control)] bg-accent text-[15px] font-medium text-white hover:bg-accent-hover"
            >
              Registrarme
            </Link>
            <Link
              href={ROUTES.signin}
              className="inline-flex h-12 items-center justify-center rounded-[var(--radius-control)] border border-ink bg-surface text-[15px] font-medium text-ink"
            >
              Iniciar sesión
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
