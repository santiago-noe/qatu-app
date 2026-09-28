import type { Metadata } from "next";
import { SearchPending } from "@/features/public/search/components/search-pending";
import { loadPublicCatalog, nameOf } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Buscar",
  robots: { index: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const [p, catalog] = await Promise.all([searchParams, loadPublicCatalog()]);
  const tab = first(p.tab);
  const zone = first(p.zone);
  const category = first(p.category);
  // Los slugs de la URL se muestran con su nombre real (Carmen Alto, Construcción).
  const categories = tab === "hire" ? catalog.trades : catalog.tools;
  return (
    <SearchPending
      tab={tab}
      q={first(p.q)}
      zone={nameOf(catalog.zones, zone) ?? zone}
      from={first(p.from)}
      to={first(p.to)}
      category={nameOf(categories, category) ?? category}
    />
  );
}
