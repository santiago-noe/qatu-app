import { ClipboardCheck, HardHat, LayoutGrid, MapPin, Percent, Users, Wrench, type LucideIcon } from "lucide-react";

/** Roles que entran al panel interno (qatu-api vuelve a exigirlos en cada ruta). */
export type StaffRole = "admin" | "moderator";

export interface AdminSection {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Quién la ve; sin indicar, solo admin. */
  roles?: StaffRole[];
}

export interface AdminGroup {
  /** Título del grupo en la barra lateral; sin él, va arriba solo. */
  label?: string;
  sections: AdminSection[];
}

export const ADMIN_HOME = "/admin";
export const MODERATION_HOME = "/admin/moderacion";

// Barra lateral del panel admin. Soporte y moderación sumarán sus grupos con sus features (015, 016).
export const ADMIN_GROUPS: AdminGroup[] = [
  { sections: [{ href: ADMIN_HOME, label: "Resumen", icon: LayoutGrid }] },
  {
    label: "Publicaciones",
    sections: [{ href: MODERATION_HOME, label: "Moderación", icon: ClipboardCheck, roles: ["admin", "moderator"] }],
  },
  {
    label: "Catálogo",
    sections: [
      { href: "/admin/categorias", label: "Categorías", icon: Wrench },
      { href: "/admin/oficios", label: "Oficios", icon: HardHat },
    ],
  },
  {
    label: "Plataforma",
    sections: [
      { href: "/admin/comisiones", label: "Comisiones", icon: Percent },
      { href: "/admin/ciudades", label: "Ciudades", icon: MapPin },
    ],
  },
  { label: "Personas", sections: [{ href: "/admin/usuarios", label: "Usuarios", icon: Users }] },
];

/** Roles internos de la persona (los demás no cuentan para el panel). */
export function staffRoles(roles: string[]): StaffRole[] {
  return roles.filter((r): r is StaffRole => r === "admin" || r === "moderator");
}

/** Grupos y secciones que ve alguien con esos roles (los grupos vacíos no se muestran). */
export function groupsFor(roles: StaffRole[]): AdminGroup[] {
  const sees = (s: AdminSection) => (s.roles ?? ["admin"]).some((r) => roles.includes(r));
  return ADMIN_GROUPS.map((g) => ({ ...g, sections: g.sections.filter(sees) })).filter((g) => g.sections.length > 0);
}

/** Primera página que puede abrir: el Resumen para admin, la moderación para moderadores. */
export function staffHome(roles: StaffRole[]): string {
  return roles.includes("admin") ? ADMIN_HOME : MODERATION_HOME;
}

/** La sección activa: el Resumen solo en /admin; las demás también en sus subrutas. */
export function isActiveSection(href: string, pathname: string): boolean {
  if (href === ADMIN_HOME) return pathname === ADMIN_HOME;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Grupo y sección de la ruta, para la barra superior ("Catálogo › Categorías"). */
export function locateSection(pathname: string): { group?: string; section?: AdminSection } {
  for (const group of ADMIN_GROUPS) {
    const section = group.sections.find((s) => isActiveSection(s.href, pathname));
    if (section) return { group: group.label, section };
  }
  return {};
}
