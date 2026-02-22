
import { HeroFloat } from "@/components/ui/hero-section";
import { BeneficSection } from "@/modules/landing/ui/sections/benefic-section";
import { FacSection } from "@/modules/landing/ui/sections/faq-section";

import { GoSection } from "@/modules/landing/ui/sections/go-section";
import { HowItWorkSection } from "@/modules/landing/ui/sections/how-it-work-section";
import { NavbarSection } from "@/modules/landing/ui/sections/navbar-section";
import { ProblemSection } from "@/modules/landing/ui/sections/problem-section";
import { StickyBannerDemo } from "@/modules/landing/ui/sections/sticky-banner-section";
import { TestimonialSection } from "@/modules/landing/ui/sections/testimonial-section";


const Page = () => {
  return (
    <div className="overflow-hidden max-w-full">
      <StickyBannerDemo />
      <NavbarSection />
      <HeroFloat />
      <ProblemSection />
      <BeneficSection />
      <HowItWorkSection />
      <TestimonialSection />
      <FacSection />
      <GoSection />
    </div>
  );
};

export default Page;
