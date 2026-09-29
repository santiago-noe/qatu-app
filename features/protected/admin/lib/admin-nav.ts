import { HardHat, MapPin, Percent, Users, Wrench, type LucideIcon } from "lucide-react";

export interface AdminSection {
  href: string;
  label: string;
  icon: LucideIcon;
}

// Secciones del panel admin. Soporte y moderación tendrán las suyas con sus features (015, 016).
export const ADMIN_SECTIONS: AdminSection[] = [
  { href: "/admin/categorias", label: "Categorías", icon: Wrench },
  { href: "/admin/oficios", label: "Oficios", icon: HardHat },
  { href: "/admin/comisiones", label: "Comisiones", icon: Percent },
  { href: "/admin/ciudades", label: "Ciudades", icon: MapPin },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
];
