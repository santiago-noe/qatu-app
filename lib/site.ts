// Datos del sitio compartidos por cabecera, pie y features públicas.
export const CITY = "Ayacucho";
export const PILOT_AREA = "Huamanga";

export interface NavLink {
  label: string;
  href: string;
  /** false: solo en el menú móvil y el pie, no en la cabecera de escritorio. */
  inHeader?: boolean;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Alquilar", href: "/#herramientas" },
  { label: "Contratar", href: "/#servicios" },
  { label: "Cómo funciona", href: "/#como-funciona" },
  { label: "Ofrece", href: "/#ofrece-en-qatu" },
  { label: "Preguntas frecuentes", href: "/#preguntas-frecuentes", inHeader: false },
];

export const LEGAL_LINKS: NavLink[] = [
  { label: "Términos y condiciones", href: "/terminos" },
  { label: "Política de privacidad", href: "/privacidad" },
  { label: "Libro de Reclamaciones", href: "/libro-de-reclamaciones" },
];

// Barra de aviso: solo información real, nunca promociones (design.md, sección 2).
export const ANNOUNCEMENT = `Piloto en ${PILOT_AREA}, ${CITY} · Regístrate gratis`;

export const SITE_TAGLINE = "Alquila. Contrata. Construye.";
export const SITE_ABOUT = "Conectamos herramientas y personas para construir un mejor Ayacucho.";
export const NAME_MEANING = "«Qatu» significa mercado en quechua.";
