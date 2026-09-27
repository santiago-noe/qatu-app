import Link from "next/link";
import { CITY, LEGAL_LINKS, NAV_LINKS } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="bg-inverse-surface text-inverse-on-surface">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-4 py-10 md:grid-cols-3 md:px-6">
        <div className="space-y-2">
          <p className="text-2xl font-extrabold text-primary-fixed">Qatu</p>
          <p className="max-w-xs text-sm text-inverse-on-surface/80">
            Alquiler de herramientas y servicios de oficios en {CITY}. Qatu es un
            intermediario: los técnicos son profesionales independientes.
          </p>
        </div>

        <nav aria-label="Producto">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-inverse-on-surface/60">
            Qatu
          </p>
          <ul className="space-y-2 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hover:underline">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Legal">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-inverse-on-surface/60">
            Legal
          </p>
          <ul className="space-y-2 text-sm">
            {LEGAL_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-inverse-on-surface/60">
        © {new Date().getFullYear()} Qatu. Todos los derechos reservados.
      </div>
    </footer>
  );
}
