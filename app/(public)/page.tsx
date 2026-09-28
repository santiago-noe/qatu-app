import { CategorySection } from "@/features/public/landing/components/category-section";
import { Faq } from "@/features/public/landing/components/faq";
import { Hero } from "@/features/public/landing/components/hero";
import { HowItWorks } from "@/features/public/landing/components/how-it-works";
import { SearchSection } from "@/features/public/landing/components/search-section";
import { Offer } from "@/features/public/landing/components/offer";
import { TOOL_SECTION, TRADE_SECTION, toCategoryItems } from "@/features/public/landing/lib/content";
import { Trust } from "@/features/public/landing/components/trust";
import { loadPublicCatalog } from "@/lib/catalog";

// Categorías, oficios y distritos salen de qatu-api: lo que el admin encienda o apague se ve al instante.
export default async function LandingPage() {
  const catalog = await loadPublicCatalog();
  return (
    <>
      <Hero />
      <SearchSection zones={catalog.zones} />
      <CategorySection section={TOOL_SECTION} items={toCategoryItems(catalog.tools, true)} />
      <CategorySection section={TRADE_SECTION} items={toCategoryItems(catalog.trades, false)} />
      <HowItWorks />
      <Trust />
      <Offer />
      <Faq />
    </>
  );
}
