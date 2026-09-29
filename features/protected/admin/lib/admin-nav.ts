import { HardHat, LayoutGrid, MapPin, Percent, Users, Wrench, type LucideIcon } from "lucide-react";

export interface AdminSection {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface AdminGroup {
  /** Título del grupo en la barra lateral; sin él, va arriba solo. */
  label?: string;
  sections: AdminSection[];
}

export const ADMIN_HOME = "/admin";

// Barra lateral del panel admin. Soporte y moderación sumarán sus grupos con sus features (015, 016).
export const ADMIN_GROUPS: AdminGroup[] = [
  { sections: [{ href: ADMIN_HOME, label: "Resumen", icon: LayoutGrid }] },
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
