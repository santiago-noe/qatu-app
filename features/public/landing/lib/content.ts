import type { LucideIcon } from "lucide-react";
import { ROUTES } from "@/lib/session";
import type { SearchTab } from "./search";
import {
  BadgeCheck,
  CalendarDays,
  CircleCheck,
  Handshake,
  Hammer,
  KeyRound,
  Lock,
  MapPin,
  PaintRoller,
  Ruler,
  Search,
  Scale,
  Scissors,
  Sparkles,
  Wallet,
  Wrench,
  Zap,
} from "lucide-react";

export const DISTRICTS = [
  "Huamanga",
  "San Juan Bautista",
  "Carmen Alto",
  "Jesús Nazareno",
  "Andrés Avelino Cáceres",
] as const;

export const SEARCH_TABS = {
  rent: {
    label: "Alquilar herramientas",
    placeholder: "Ej. rotomartillo, escalera, hidrolavadora",
  },
  hire: {
    label: "Contratar servicios",
    placeholder: "Ej. gasfitero para una fuga, pintor",
  },
} as const;

/** Ícono + título + texto: chips del hero, confianza y pasos de "Cómo funciona". */
export interface IconItem {
  icon: LucideIcon;
  title: string;
  text: string;
}

export interface CallToAction {
  label: string;
  href: string;
}

// Hero (design.md "Obra"): solo promete lo que existe en el piloto (docs/05). Sin cifras ni reseñas.
export const HERO = {
  eyebrow: "Alquiler de herramientas y servicios",
  title: ["Las herramientas", "que tu obra necesita,"],
  titleHighlight: "cuando las necesitas.",
  subtitle:
    "Alquila equipos de construcción, jardinería, limpieza, pintura y más, o contrata a un técnico. Fácil, seguro y con precios claros en Huamanga.",
  primaryCta: { label: "Alquilar ahora", href: "#buscar" } satisfies CallToAction,
  secondaryCta: { label: "Cómo funciona", href: "#como-funciona" } satisfies CallToAction,
  features: [
    { icon: BadgeCheck, title: "Cuentas verificadas", text: "Validamos la identidad" },
    { icon: Wallet, title: "Precios claros", text: "Ves el total antes" },
    { icon: MapPin, title: "Soporte local", text: "Estamos en Ayacucho" },
  ] satisfies IconItem[],
  image: {
    src: "/images/hero-1.webp",
    alt: "Mujer sosteniendo un rotomartillo en un taller",
  },
} as const;

export const SEARCH_SECTION = {
  title: "¿Qué necesitas hoy?",
  districtsNote: `Distritos iniciales: ${DISTRICTS.join(", ")}.`,
} as const;

// La verificación es un filtro, no una garantía (docs/05).
export const TRUST = {
  intro: {
    eyebrow: "Confianza",
    title: "Reglas claras desde el primer día",
    description: "Así cuidamos cada alquiler y cada servicio en Qatu.",
  } satisfies SectionIntro,
  note: "La verificación es un filtro para reducir riesgos, no una garantía absoluta.",
  items: [
    {
      icon: BadgeCheck,
      title: "Verificación de identidad",
      text: "Pedimos verificar la identidad con DNI antes de habilitar ciertas acciones.",
    },
    {
      icon: Scale,
      title: "Intermediarios, no empleadores",
      text: "Qatu conecta a las partes. Los técnicos son independientes y las reglas de cancelación y disputas se muestran antes de confirmar.",
    },
    {
      icon: Lock,
      title: "Garantía con registro y evidencias",
      text: "En los alquileres, el depósito y el estado de la herramienta quedan registrados con fotos y checklist, y Qatu media si hay una disputa.",
    },
    {
      icon: Wallet,
      title: "Precios claros en soles (S/)",
      text: "Ves el total desglosado (servicio, tarifa, delivery y garantía) antes de confirmar. Sin cargos ocultos.",
    },
  ] satisfies IconItem[],
} as const;

export interface SectionIntro {
  eyebrow: string;
  title: string;
  description: string;
}

export interface ImageAsset {
  src: string;
  alt: string;
}

export interface CategoryItem {
  name: string;
  description: string;
  /** Foto de la tarjeta; sin foto se muestra el ícono sobre fondo oscuro. */
  image?: ImageAsset;
  icon?: LucideIcon;
}

export interface CategorySectionData {
  id: string;
  tab: SearchTab;
  intro: SectionIntro;
  /** Texto del botón de cada tarjeta. */
  cta: string;
  /** Fondo de la sección. */
  tone: "white" | "soft";
  items: CategoryItem[];
}

// Mosaico: se muestran las 5 primeras (la primera destacada); el resto se alcanza con "Ver todos".
// Sin precios, cantidades ni "más alquiladas" (design.md, sección 2).
export const TOOL_SECTION: CategorySectionData = {
  id: "herramientas",
  tab: "rent",
  intro: {
    eyebrow: "Categorías",
    title: "Encuentra lo que necesitas",
    description: "Las categorías con las que empezamos el piloto en Huamanga.",
  },
  cta: "Ver equipos",
  tone: "white",
  items: [] = [
  {
    name: "Construcción",
    description: "Rotomartillos, mezcladoras y más equipos para tu obra.",
    image: { src: "/images/categories/construccion.webp", alt: "Herramientas eléctricas y equipos de construcción" },
  },
  {
    name: "Carpintería y taller",
    description: "Sierras, lijadoras y cepilladoras para madera.",
    image: { src: "/images/categories/carpinteria.webp", alt: "Herramientas de carpintería sobre un banco de trabajo" },
  },
  {
    name: "Jardín",
    description: "Podadoras, desbrozadoras y motosierras.",
    image: { src: "/images/categories/jardin.webp", alt: "Cortadora de césped y desbrozadora sobre el pasto" },
  },
  {
    name: "Limpieza",
    description: "Hidrolavadoras y aspiradoras industriales.",
    image: { src: "/images/categories/limpieza.webp", alt: "Balde con implementos de limpieza" },
  },
  {
    name: "Pintura",
    description: "Compresoras, pistolas y escaleras.",
    image: { src: "/images/categories/pintura.webp", alt: "Rodillo, brocha, cinta y balde de pintura" },
  },
],
};

// Fotos de oficios pendientes: mientras tanto, cada tarjeta muestra su ícono.
export const TRADE_SECTION: CategorySectionData = {
  id: "servicios",
  tab: "hire",
  intro: {
    eyebrow: "Servicios",
    title: "Oficios para tu hogar o negocio",
    description: "Contrata con precio fijo o pide cotizaciones a varios técnicos.",
  },
  cta: "Ver técnicos",
  tone: "soft",
  items: [
    { icon: Wrench, name: "Gasfitería", description: "Fugas, griferías, termas y mantenimiento de tanques." },
    { icon: Zap, name: "Electricidad", description: "Cortocircuitos, cableado, tableros e iluminación." },
    { icon: KeyRound, name: "Cerrajería", description: "Apertura de cerraduras, cambio de cilindros y cerrojos." },
    { icon: PaintRoller, name: "Pintura", description: "Interiores, fachadas, empastado y sellado de humedad." },
    { icon: Hammer, name: "Albañilería menor", description: "Resanes, tarrajeo, enchapes y pequeñas refacciones." },
    { icon: Scissors, name: "Jardinería", description: "Poda, limpieza y mantenimiento de áreas verdes." },
    { icon: Ruler, name: "Carpintería", description: "Ajuste de puertas, reparación de muebles y armado." },
    { icon: Sparkles, name: "Limpieza", description: "Limpieza de hogares, oficinas y post obra." },
  ],
};

// Franja "Cómo funciona" (design.md, sección 4). El delivery es opcional: "Recoge o recibe" (docs/02).
export const HOW_IT_WORKS = {
  title: "¿Cómo funciona Qatu?",
  steps: [
    { icon: Search, title: "Busca", text: "Encuentra el equipo o el técnico que necesitas." },
    { icon: CalendarDays, title: "Reserva", text: "Elige fechas y confirma con el total a la vista." },
    { icon: Handshake, title: "Recoge o recibe", text: "Coordina el recojo, el delivery o la visita." },
    { icon: CircleCheck, title: "Usa y devuelve", text: "La entrega y la devolución quedan registradas." },
  ] satisfies IconItem[],
} as const;

export const OFFER = {
  eyebrow: "Ofrece en Qatu",
  heading: "Saca provecho a tus herramientas o encuentra clientes para tu oficio.",
  points: [
    { lead: "Tienes herramientas guardadas:", text: "publícalas y decide tus precios, tu garantía y tu disponibilidad." },
    { lead: "Eres técnico o maestro de obra:", text: "muestra tu experiencia y recibe solicitudes de vecinos de Huamanga." },
  ],
  primaryCta: { label: "Publicar herramienta", href: ROUTES.signin } satisfies CallToAction,
  secondaryCta: { label: "Ofrecer mi oficio", href: ROUTES.signin } satisfies CallToAction,
} as const;

export interface FaqItem {
  question: string;
  answer: string;
}

// Las cifras de comisión están por validar en piloto (docs/01): no se publican aquí.
export const FAQ_INTRO: SectionIntro = {
  eyebrow: "Ayuda",
  title: "Preguntas frecuentes",
  description: "Lo que más nos preguntan sobre alquilar y contratar en Qatu.",
};

export const FAQ: FaqItem[] = [
  {
    question: "¿Qué es Qatu y en qué ciudades funciona?",
    answer:
      "Qatu es un marketplace para alquilar herramientas y contratar servicios de oficios. Por ahora estamos en piloto en Huamanga, Ayacucho.",
  },
  {
    question: "¿Cómo funciona la garantía en los alquileres?",
    answer:
      "El arrendador puede pedir una garantía. Qatu registra su monto, las condiciones y las evidencias (fotos y checklist) de entrega y devolución, y media si hay una disputa. En el piloto, Qatu no custodia dinero.",
  },
  {
    question: "¿Cuánto cuesta usar Qatu?",
    answer:
      "Registrarse y explorar es gratis. Por cada transacción se muestra siempre el desglose completo antes de confirmar: el alquiler o servicio, la tarifa de servicio, el delivery si aplica y la garantía.",
  },
  {
    question: "¿Cómo se paga?",
    answer:
      "Los montos se muestran en soles (S/). En el piloto el pago se coordina y registra entre las partes; luego se sumarán pasarelas de pago.",
  },
  {
    question: "¿Qué pasa si algo sale mal?",
    answer:
      "Puedes reportar una incidencia y abrir una disputa con tus evidencias. También tienes a tu disposición el Libro de Reclamaciones.",
  },
  {
    question: "¿Los técnicos trabajan para Qatu?",
    answer:
      "No. Los técnicos son profesionales independientes. Qatu es un intermediario que facilita el contacto, la contratación y la confianza.",
  },
];

