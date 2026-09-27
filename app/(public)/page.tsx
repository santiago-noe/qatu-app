import { CategorySection } from "@/features/public/landing/components/category-section";
import { Faq } from "@/features/public/landing/components/faq";
import { Hero } from "@/features/public/landing/components/hero";
import { HowItWorks } from "@/features/public/landing/components/how-it-works";
import { SearchSection } from "@/features/public/landing/components/search-section";
import { Offer } from "@/features/public/landing/components/offer";
import { TOOL_SECTION, TRADE_SECTION } from "@/features/public/landing/lib/content";
import { Trust } from "@/features/public/landing/components/trust";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <SearchSection />
      <CategorySection section={TOOL_SECTION} />
      <CategorySection section={TRADE_SECTION} />
      <Trust />
      <HowItWorks />
      <Offer />
      <Faq />
    </>
  );
}
