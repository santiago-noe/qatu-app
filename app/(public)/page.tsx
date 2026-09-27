import { Categories } from "@/features/public/landing/components/categories";
import { Faq } from "@/features/public/landing/components/faq";
import { Hero } from "@/features/public/landing/components/hero";
import { HowItWorks } from "@/features/public/landing/components/how-it-works";
import { SearchSection } from "@/features/public/landing/components/search-section";
import { Offer } from "@/features/public/landing/components/offer";
import { ToolCategories } from "@/features/public/landing/components/tool-categories";
import { Trust } from "@/features/public/landing/components/trust";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <SearchSection />
      <ToolCategories />
      <Categories />
      <Trust />
      <HowItWorks />
      <Offer />
      <Faq />
    </>
  );
}
