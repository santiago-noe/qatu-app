import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/layout/container";
import { PanelHeader } from "./panel-header";

interface PanelPageProps {
  title: string;
  description?: string;
  /** Enlace para volver ("Mis publicaciones"). */
  back?: { href: string; label: string };
  /** Acción principal a la derecha del título. */
  action?: React.ReactNode;
  children: React.ReactNode;
}

// Marco de las páginas del panel de la persona (no del admin): cabecera, volver, un h1 y contenido.
export function PanelPage({ title, description, back, action, children }: PanelPageProps) {
  return (
    <div className="min-h-screen bg-bg-soft">
      <PanelHeader />
      <main>
        <Container className="py-8 sm:py-12">
          {back && (
            <Link
              href={back.href}
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 underline-offset-4 hover:text-ink hover:underline"
            >
              <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden />
              {back.label}
            </Link>
          )}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
              {description && <p className="mt-2 max-w-2xl text-ink-2">{description}</p>}
            </div>
            {action}
          </div>
          <div className="mt-8">{children}</div>
        </Container>
      </main>
    </div>
  );
}
