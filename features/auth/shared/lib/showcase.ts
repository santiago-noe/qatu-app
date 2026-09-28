import type { LucideIcon } from "lucide-react";
import { LockKeyhole, MapPin, ReceiptText, ShieldCheck, Timer, Users } from "lucide-react";
import { PILOT_AREA } from "@/lib/site";

export interface Benefit {
  icon: LucideIcon;
  title: string;
  text: string;
}

/**
 * Panel oscuro de marca junto al formulario de acceso (escritorio).
 * Solo afirmaciones reales (design.md, sección 2): nada de cifras ni funciones que aún no existen.
 */
export interface Showcase {
  eyebrow: string;
  /** Líneas del titular en blanco; `highlight` cierra en amarillo (10:1 sobre el fondo oscuro). */
  lines: string[];
  highlight: string;
  text: string;
  benefits: [Benefit, Benefit, Benefit];
}

export const SIGNIN_SHOWCASE: Showcase = {
  eyebrow: "Comunidad local",
  lines: ["Tu comunidad de", "confianza en"],
  highlight: "Ayacucho.",
  text: `Alquila herramientas y contrata técnicos de ${PILOT_AREA} desde un solo lugar.`,
  benefits: [
    { icon: ShieldCheck, title: "Cuentas con correo confirmado", text: "Nadie alquila ni contrata sin confirmarlo." },
    { icon: ReceiptText, title: "Precios claros", text: "Ves el total antes de confirmar." },
    { icon: MapPin, title: `Soporte local en ${PILOT_AREA}`, text: "Estamos en Ayacucho para ayudarte." },
  ],
};

export const SIGNUP_SHOWCASE: Showcase = {
  eyebrow: "Únete gratis",
  lines: ["Únete a la red", "local de"],
  highlight: `${PILOT_AREA}.`,
  text: "Alquila, contrata u ofrece tus herramientas y tu oficio a tus vecinos.",
  benefits: [
    { icon: Timer, title: "Tu cuenta en un minuto", text: "Solo nombre, correo y contraseña." },
    { icon: Users, title: "Para vecinos y técnicos", text: "Particulares, arrendadores y maestros de obra." },
    { icon: LockKeyhole, title: "Tus datos, cuidados", text: "Los tratamos según la Ley N.º 29733." },
  ],
};
