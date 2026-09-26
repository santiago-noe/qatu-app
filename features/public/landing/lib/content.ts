import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Droplets,
  Hammer,
  HardHat,
  KeyRound,
  Lock,
  PaintRoller,
  Ruler,
  Scale,
  Scissors,
  Shovel,
  Sparkles,
  Wallet,
  Wrench,
  Zap,
} from "lucide-react";

export const CITY = "Ayacucho";
export const PILOT_AREA = "Huamanga";

export const DISTRICTS = [
  "Huamanga",
  "San Juan Bautista",
  "Carmen Alto",
  "Jesús Nazareno",
  "Andrés Avelino Cáceres",
] as const;

export const NAV_LINKS = [
  { label: "Alquilar herramientas", href: "#herramientas" },
  { label: "Contratar servicios", href: "#servicios" },
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Ofrece en Qatu", href: "#ofrece-en-qatu" },
  { label: "Preguntas frecuentes", href: "#preguntas-frecuentes" },
] as const;

export const SEARCH_TABS = {
  rent: {
    label: "Alquilar herramientas",
    placeholder: "Ej. rotomartillo, escalera, hidrolavadora",
    submitLabel: "Buscar herramientas",
  },
  hire: {
    label: "Contratar servicios",
    placeholder: "Ej. gasfitero para una fuga, pintor",
    submitLabel: "Buscar técnicos",
  },
} as const;

export const HERO = {
  badge: "Piloto en Huamanga, Ayacucho",
  subtitle:
    "Conectamos a vecinos y técnicos de Huamanga. Alquila en vez de comprar, saca provecho a tus herramientas ociosas y encuentra mano de obra cerca de ti.",
  ctaTools: "Ver herramientas",
  ctaServices: "Buscar técnicos",
  districtsNote: `Distritos iniciales: ${DISTRICTS.join(", ")}.`,
} as const;

export interface TrustItem {
  icon: LucideIcon;
  title: string;
  text: string;
}

// La verificación es un filtro, no una garantía (docs/05).
export const TRUST_ITEMS: TrustItem[] = [
  {
    icon: BadgeCheck,
    title: "Verificación de identidad",
    text: "Pedimos verificar la identidad con DNI antes de habilitar ciertas acciones. Es un filtro para reducir riesgos, no una garantía absoluta.",
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
];

export interface ToolCategory {
  icon: LucideIcon;
  tag: string;
  title: string;
  text: string;
}

export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    icon: HardHat,
    tag: "Construcción",
    title: "Rotomartillos y mezcladoras",
    text: "Equipos para perforar, demoler y mezclar en tu obra.",
  },
  {
    icon: Ruler,
    tag: "Carpintería y taller",
    title: "Sierras, lijadoras y cepilladoras",
    text: "Para armar muebles, techos y trabajos en madera.",
  },
  {
    icon: Shovel,
    tag: "Jardín",
    title: "Podadoras, desbrozadoras y motosierras",
    text: "Para limpiar terrenos y mantener jardines.",
  },
  {
    icon: Droplets,
    tag: "Limpieza",
    title: "Hidrolavadoras y aspiradoras industriales",
    text: "Limpieza a presión para fachadas, patios y locales.",
  },
  {
    icon: PaintRoller,
    tag: "Pintura",
    title: "Compresoras, pistolas y escaleras",
    text: "Todo lo que necesitas para pintar y trabajar en altura.",
  },
];

export interface TradeCategory {
  icon: LucideIcon;
  title: string;
  text: string;
}

export const TRADE_CATEGORIES: TradeCategory[] = [
  {
    icon: Wrench,
    title: "Gasfitería",
    text: "Fugas, griferías, termas y mantenimiento de tanques.",
  },
  {
    icon: Zap,
    title: "Electricidad",
    text: "Cortocircuitos, cableado, tableros e iluminación.",
  },
  {
    icon: KeyRound,
    title: "Cerrajería",
    text: "Apertura de cerraduras, cambio de cilindros y cerrojos.",
  },
  {
    icon: PaintRoller,
    title: "Pintura",
    text: "Interiores, fachadas, empastado y sellado de humedad.",
  },
  {
    icon: Hammer,
    title: "Albañilería menor",
    text: "Resanes, tarrajeo, enchapes y pequeñas refacciones.",
  },
  {
    icon: Scissors,
    title: "Jardinería",
    text: "Poda, limpieza y mantenimiento de áreas verdes.",
  },
  {
    icon: Ruler,
    title: "Carpintería",
    text: "Ajuste de puertas, reparación de muebles y armado.",
  },
  {
    icon: Sparkles,
    title: "Limpieza",
    text: "Limpieza de hogares, oficinas y post obra.",
  },
];

export interface Step {
  title: string;
  text: string;
}

export const RENT_STEPS: Step[] = [
  {
    title: "Busca y reserva",
    text: "Explora las herramientas disponibles en tu zona y elige las fechas que necesitas.",
  },
  {
    title: "Coordina la entrega",
    text: "Revisa el desglose total, incluida la garantía, y acuerda entrega o recojo. Ambos registran el estado con fotos.",
  },
  {
    title: "Usa y devuelve",
    text: "Al devolver la herramienta en buen estado, la garantía se cierra según las condiciones acordadas.",
  },
];

export const HIRE_STEPS: Step[] = [
  {
    title: "Cuenta qué necesitas",
    text: "Describe el trabajo, agrega fotos y compara técnicos por oficio y zona.",
  },
  {
    title: "Reserva o pide cotización",
    text: "Contrata un paquete con precio fijo o recibe cotizaciones de varios técnicos y elige.",
  },
  {
    title: "Recibe el servicio y opina",
    text: "Confirma el trabajo terminado y deja una reseña verificada para ayudar a otros vecinos.",
  },
];

export const OFFER = {
  heading:
    "Saca provecho a tus herramientas o encuentra clientes para tu oficio.",
  points: [
    {
      lead: "Tienes herramientas guardadas:",
      text: "publícalas para alquiler y decide tus precios, tu garantía y tu disponibilidad.",
    },
    {
      lead: "Eres técnico o maestro de obra:",
      text: "muestra tu experiencia, tus paquetes de servicio y recibe solicitudes de vecinos de Huamanga.",
    },
  ],
  cta: "Comenzar a ofrecer",
} as const;

export interface FaqItem {
  question: string;
  answer: string;
}

// Las cifras de comisión están por validar en piloto (docs/01): no se publican aquí.
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

export const FOOTER_LINKS = {
  legal: [
    { label: "Términos y condiciones", href: "/terminos" },
    { label: "Política de privacidad", href: "/privacidad" },
    { label: "Libro de Reclamaciones", href: "/libro-de-reclamaciones" },
  ],
  product: [
    { label: "Alquilar herramientas", href: "#herramientas" },
    { label: "Contratar servicios", href: "#servicios" },
    { label: "Cómo funciona", href: "#como-funciona" },
    { label: "Ofrece en Qatu", href: "#ofrece-en-qatu" },
  ],
} as const;
