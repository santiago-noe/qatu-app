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
