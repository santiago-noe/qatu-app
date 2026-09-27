import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LEGAL_LINKS, NAME_MEANING, NAV_LINKS, SITE_ABOUT, SITE_TAGLINE, type NavLink } from "@/lib/site";
import { ROUTES } from "@/lib/session";
import { cn } from "@/lib/utils";
import { Container } from "./container";
import { Logo } from "./logo";

const LIBRO = "/libro-de-reclamaciones";

function LinkColumn({ title, links }: { title: string; links: NavLink[] }) {
  return (
    <nav aria-label={title}>
      <p className="mb-4 text-sm font-semibold text-white">{title}</p>
      <ul className="space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className={cn(
                "text-footer-ink hover:text-white",
                // Libro de Reclamaciones siempre visible (INDECOPI)
                l.href === LIBRO && "inline-block rounded-[var(--radius-control)] border border-footer-ink-2 px-2.5 py-1",
              )}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="rounded-t-[24px] bg-footer">
      <Container className="grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] lg:py-16">
        <div className="space-y-4">
          <Logo variant="light" />
          <p className="text-sm font-medium text-brand">{SITE_TAGLINE}</p>
          <p className="max-w-xs text-sm text-footer-ink">{SITE_ABOUT}</p>
        </div>

        <LinkColumn title="Qatu" links={NAV_LINKS} />
        <LinkColumn title="Legal" links={LEGAL_LINKS} />

        {/* Sin lista de espera aprobada, el pie invita a crear cuenta (design.md, sección 2) */}
        <div className="space-y-4">
          <p className="text-sm font-semibold text-white">Crea tu cuenta gratis</p>
          <p className="text-sm text-footer-ink">Alquila, contrata u ofrece en Huamanga desde un solo lugar.</p>
          <Button asChild className="h-11 rounded-[var(--radius-control)] bg-brand px-5 text-ink hover:bg-brand/90">
            <Link href={ROUTES.signup}>
              Registrarme
              <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
            </Link>
          </Button>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-2 py-5 text-xs text-footer-ink-2 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Qatu. Todos los derechos reservados.</p>
          <p>{NAME_MEANING}</p>
        </Container>
      </div>
    </footer>
  );
}
