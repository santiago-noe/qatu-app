export type SearchTab = "rent" | "hire";

export interface SearchParams {
  tab: SearchTab;
  q: string;
  zone: string;
  from: string;
  to: string;
  category?: string;
}

export const ALL_ZONES = "todo";

/** "Hidrolavadoras y aspiradoras" -> "hidrolavadoras-y-aspiradoras" */
export function toSlug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Fechas ISO (yyyy-mm-dd): "hasta" no puede ser anterior a "desde". */
export function validateDates(from: string, to: string): string | null {
  if (from && to && to < from) {
    return "La fecha final no puede ser anterior a la inicial.";
  }
  return null;
}

/** Arma la URL de búsqueda; omite los parámetros vacíos. */
export function buildSearchUrl(params: Partial<SearchParams>): string {
  const query = new URLSearchParams();
  const tab = params.tab ?? "rent";
  query.set("tab", tab);
  if (params.q?.trim()) query.set("q", params.q.trim());
  if (params.zone && params.zone !== ALL_ZONES) query.set("zone", params.zone);
  if (tab === "rent") {
    if (params.from) query.set("from", params.from);
    if (params.to) query.set("to", params.to);
  }
  if (params.category) query.set("category", params.category);
  return `/buscar?${query.toString()}`;
}
