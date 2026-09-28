// qatu-api guarda el nombre del ícono de cada categoría ("HardHat"); aquí se traduce al componente.
// Un registro explícito (y no import dinámico) mantiene el paquete chico: solo viajan estos íconos.
import {
  BrickWall,
  Hammer,
  HardHat,
  KeyRound,
  PaintRoller,
  Projector,
  Ruler,
  Scissors,
  Sofa,
  Sparkles,
  SprayCan,
  Tag,
  Trees,
  WashingMachine,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const CATALOG_ICONS: Record<string, LucideIcon> = {
  BrickWall,
  Hammer,
  HardHat,
  KeyRound,
  PaintRoller,
  Projector,
  Ruler,
  Scissors,
  Sofa,
  Sparkles,
  SprayCan,
  Trees,
  WashingMachine,
  Wrench,
  Zap,
};

/** Ícono de una categoría; si el admin usa uno que la app aún no registró, un ícono genérico. */
export function catalogIcon(name: string | undefined): LucideIcon {
  return (name && Object.hasOwn(CATALOG_ICONS, name) && CATALOG_ICONS[name]) || Tag;
}
