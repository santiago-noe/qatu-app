// Roles de qatu-api (internal/core/domain/account.go). El admin solo asigna los internos; los de
// oferta (arrendador, proveedor) los obtiene cada persona al verificarse.
export const ROLE_LABELS: Record<string, string> = {
  client: "Cliente",
  lender: "Arrendador",
  provider: "Proveedor",
  support: "Soporte",
  moderator: "Moderación",
  admin: "Administración",
};

export const INTERNAL_ROLES = ["support", "moderator", "admin"] as const;

export const roleLabel = (role: string) => (Object.hasOwn(ROLE_LABELS, role) ? ROLE_LABELS[role] : role);

/** Qué roles internos agregar y quitar para pasar de los actuales a los marcados. */
export function rolesDiff(current: string[], selected: string[]) {
  return {
    add: selected.filter((r) => !current.includes(r)),
    remove: INTERNAL_ROLES.filter((r) => current.includes(r) && !selected.includes(r)),
  };
}

/** "Rosa María Quispe" → "RQ" (primera y última palabra) para el avatar sin foto. */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toLocaleUpperCase("es-PE");
}
