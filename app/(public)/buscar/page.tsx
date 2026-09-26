import type { Metadata } from "next";
import { SearchPending } from "@/features/public/search/components/search-pending";

export const metadata: Metadata = {
  title: "Buscar",
  robots: { index: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const p = await searchParams;
  return (
    <SearchPending
      tab={first(p.tab)}
      q={first(p.q)}
      zone={first(p.zone)}
      from={first(p.from)}
      to={first(p.to)}
      category={first(p.category)}
    />
  );
}
