import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  CircleCheck,
  HardHat,
  MapPin,
  Percent,
  Plus,
  Search,
  ShieldAlert,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { IconBadge } from "@/components/layout/icon-badge";
import { Button } from "@/components/ui/button";
import { formatBps, formatWhen, SETTINGS } from "@/features/protected/admin/lib/settings";
import type { summarize } from "@/features/protected/admin/lib/overview";
import { Badge } from "./badge";

type Summary = ReturnType<typeof summarize>;

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

const CARD = "rounded-[var(--radius-card)] border border-line bg-bg shadow-[var(--shadow-card)]";

interface AdminOverviewProps {
  greeting: string;
  firstName: string;
  cityNames: string[];
  summary: Summary;
}

// Portada del panel admin. Cada cifra sale de qatu-api: sin gráficos ni datos de ejemplo
// (design.md). Reservas, ingresos y alertas llegarán con sus features (006 en adelante, 017).
export function AdminOverview({ greeting, firstName, cityNames, summary }: AdminOverviewProps) {
  const { rental, service, cities, commissions, lastChange, attention } = summary;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section
          aria-labelledby="admin-titulo"
          className="relative overflow-hidden rounded-3xl border border-line bg-bg bg-[radial-gradient(ellipse_70%_90%_at_0%_0%,var(--color-cream),transparent),radial-gradient(ellipse_60%_70%_at_100%_100%,var(--color-brand-soft),transparent)] p-6 sm:p-8"
        >
          <div className="relative z-10 max-w-md">
            <p className="eyebrow">Panel de administración</p>
            <h1 id="admin-titulo" className="mt-2 text-2xl font-bold tracking-tight sm:text-[32px] sm:leading-tight">
              {greeting}, {firstName} <span aria-hidden>👋</span>
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
              {cityNames.length > 0
                ? `Administras el catálogo de ${cityNames.join(", ")}: categorías, oficios, comisiones y cuentas.`
                : "Ninguna ciudad está activa: el público no ve el catálogo."}
            </p>
            <Button asChild className="group mt-5 h-11 rounded-[var(--radius-control)] px-5">
              <Link href="/admin/categorias">
                Ir a categorías
                <ArrowRight className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
              </Link>
            </Button>
          </div>
          <Image
            src="/images/auth/tools-bench.webp"
            alt=""
            width={220}
            height={260}
            className="absolute -bottom-6 right-6 hidden h-[260px] w-[220px] rotate-3 rounded-2xl object-cover shadow-[0_24px_48px_-24px_rgb(31_41_55/0.6)] md:block"
          />
        </section>

        <section aria-labelledby="acciones-rapidas" className={`${CARD} p-5`}>
          <h2 id="acciones-rapidas" className="text-base font-semibold">
            Acciones rápidas
          </h2>
          <ul className="mt-3 flex flex-col gap-1">
            <QuickAction href="/admin/categorias" icon={Plus} label="Crear una categoría" />
            <QuickAction href="/admin/comisiones" icon={Percent} label="Cambiar una comisión" />
            <QuickAction href="/admin/usuarios" icon={Search} label="Buscar una cuenta" />
            <QuickAction href="/admin/ciudades" icon={MapPin} label="Encender o apagar ciudades" />
          </ul>
        </section>
      </div>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          href="/admin/categorias"
          icon={Wrench}
          label="Categorías activas"
          value={rental.roots - rental.rootsOff}
          detail={`${rental.roots} en total · ${plural(rental.children, "tipo", "tipos")}`}
        />
        <StatCard
          href="/admin/categorias"
          icon={ShieldAlert}
          label="Tipos de riesgo alto"
          value={rental.highRisk}
          detail="Definen la verificación mínima para alquilar"
        />
        <StatCard
          href="/admin/oficios"
          icon={HardHat}
          label="Oficios activos"
          value={service.roots - service.rootsOff}
          detail={`${service.roots} en total`}
        />
        <StatCard
          href="/admin/ciudades"
          icon={MapPin}
          label="Ciudades activas"
          value={cities.on}
          detail={`de ${plural(cities.total, "registrada", "registradas")}`}
        />
      </ul>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
        <section aria-labelledby="comisiones-vigentes" className={`${CARD} p-5`}>
          <div className="flex items-center justify-between gap-3">
            <h2 id="comisiones-vigentes" className="text-base font-semibold">
              Comisiones vigentes
            </h2>
            <Link href="/admin/comisiones" className="text-sm font-medium text-brand-text underline-offset-4 hover:underline">
              Ver todas
            </Link>
          </div>
          <dl className="mt-3 divide-y divide-line">
            {SETTINGS.map((info) => {
              const value = commissions.find((c) => c.key === info.key)?.value;
              return (
                <div key={info.key} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-sm text-ink-2">{info.label}</dt>
                  <dd className="text-lg font-semibold tabular-nums">{value === undefined ? "Sin valor" : formatBps(value)}</dd>
                </div>
              );
            })}
          </dl>
          {lastChange && <p className="mt-2 text-xs text-ink-3">Último cambio: {formatWhen(lastChange)}</p>}
        </section>

        <section aria-labelledby="para-revisar" className={`${CARD} p-5`}>
          <h2 id="para-revisar" className="text-base font-semibold">
            Para revisar
          </h2>
          {attention.items.length === 0 ? (
            <p className="mt-3 flex items-start gap-2 text-sm text-ink-2">
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-ok" strokeWidth={1.5} aria-hidden />
              Todo en orden: ninguna categoría apagada ni prohibida, y todas las ciudades están activas.
            </p>
          ) : (
            <>
              <ul className="mt-2 divide-y divide-line">
                {attention.items.map((item) => (
                  <li key={`${item.href}-${item.label}`}>
                    <Link href={item.href} className="group flex items-center gap-3 py-2.5">
                      <span className="min-w-0 flex-1 truncate text-sm font-medium group-hover:underline">{item.label}</span>
                      <Badge tone={item.detail === "Prohibida" ? "danger" : "neutral"}>{item.detail}</Badge>
                      <ChevronRight className="size-4 text-ink-3" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
              {attention.more > 0 && <p className="mt-1 text-xs text-ink-3">y {attention.more} más</p>}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function QuickAction({ href, icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-center gap-3 rounded-[var(--radius-control)] px-2 py-2 transition-colors hover:bg-bg-soft"
      >
        <IconBadge icon={icon} size="sm" />
        <span className="flex-1 text-sm font-medium">{label}</span>
        <ChevronRight className="size-4 text-ink-3 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
      </Link>
    </li>
  );
}

interface StatCardProps {
  href: string;
  icon: LucideIcon;
  label: string;
  value: number;
  detail: string;
}

function StatCard({ href, icon, label, value, detail }: StatCardProps) {
  return (
    <li>
      <Link href={href} className={`${CARD} group flex h-full flex-col gap-3 p-5 transition-colors hover:border-ink-3/40`}>
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-ink-2">{label}</p>
          <IconBadge icon={icon} size="sm" />
        </div>
        <p className="text-3xl font-bold tabular-nums tracking-tight">{value}</p>
        <p className="text-xs text-ink-3">{detail}</p>
      </Link>
    </li>
  );
}
