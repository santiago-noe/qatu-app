import { Categories } from "@/features/public/landing/components/categories";
import { Faq } from "@/features/public/landing/components/faq";
import { Hero } from "@/features/public/landing/components/hero";
import { HowItWorks } from "@/features/public/landing/components/how-it-works";
import { Offer } from "@/features/public/landing/components/offer";
import { Trust } from "@/features/public/landing/components/trust";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Trust />
      <Categories />
      <HowItWorks />
      <Offer />
      <Faq />
    </>
  );
}
