"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { groupsFor, isActiveSection, type StaffRole } from "@/features/protected/admin/lib/admin-nav";

// Secciones del panel por grupos (barra lateral y menú del celular): solo las de sus roles.
export function AdminNav({ roles }: { roles: StaffRole[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Secciones de administración" className="flex flex-col gap-5">
      {groupsFor(roles).map((group, i) => (
        <div key={group.label ?? i}>
          {group.label && (
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">{group.label}</p>
          )}
          <ul className="flex flex-col gap-0.5">
            {group.sections.map(({ href, label, icon: Icon }) => {
              const active = isActiveSection(href, pathname);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex h-10 items-center gap-3 rounded-[var(--radius-control)] px-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-cream text-brand-text before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-full before:bg-brand-text"
                        : "text-ink-2 hover:bg-bg-soft hover:text-ink",
                    )}
                  >
                    <Icon className="size-[18px]" strokeWidth={1.5} aria-hidden />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
