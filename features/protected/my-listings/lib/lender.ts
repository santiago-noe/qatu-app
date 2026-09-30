// Perfil de arrendador: validación inmediata. Las reglas son las de qatu-api
// (internal/core/domain/lender.go), que vuelve a validar todo.

export type LenderField = "kind" | "business_name" | "phone" | "zone" | "accept_terms";

export interface LenderDraft {
  kind: string;
  businessName: string;
  phone: string;
  zone: string;
  acceptTerms: boolean;
  /** La primera vez hay que aceptar las condiciones. */
  first: boolean;
}

/** "987 654 321", "+51 987-654-321" → true. Solo celulares peruanos (9 dígitos que empiezan con 9). */
export function isPeruMobile(raw: string): boolean {
  if (/[^\d\s()+.-]/.test(raw)) return false;
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("51")) digits = digits.slice(2);
  if (digits.length === 10 && digits.startsWith("0")) digits = digits.slice(1);
  return /^9\d{8}$/.test(digits);
}

export function validateLender(d: LenderDraft): Partial<Record<LenderField, string>> {
  const errors: Partial<Record<LenderField, string>> = {};
  if (d.kind !== "person" && d.kind !== "business") errors.kind = "Elige si publicas como persona o como negocio.";
  const name = d.businessName.trim();
  if (d.kind === "business" && (name.length < 2 || name.length > 80))
    errors.business_name = "Escribe el nombre de tu negocio (2 a 80 caracteres).";
  if (!isPeruMobile(d.phone)) errors.phone = "Escribe un celular de 9 dígitos que empiece con 9.";
  if (!d.zone) errors.zone = "Elige tu distrito.";
  if (d.first && !d.acceptTerms) errors.accept_terms = "Acepta las condiciones de arrendador para continuar.";
  return errors;
}

// Códigos de qatu-api (handler/errors.go) que corresponden a un campo.
const FIELD_BY_CODE: Record<string, LenderField> = {
  celular_invalido: "phone",
  nombre_negocio_invalido: "business_name",
  ubicacion_invalida: "zone",
  condiciones_requeridas: "accept_terms",
};

export function lenderFieldForError(code: string): LenderField | undefined {
  return Object.hasOwn(FIELD_BY_CODE, code) ? FIELD_BY_CODE[code] : undefined;
}
