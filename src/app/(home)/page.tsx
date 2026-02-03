
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { HeroFloat } from "@/components/ui/hero-section";
import { BeneficSection } from "@/modules/landing/ui/sections/benefic-section";
import { FacSection } from "@/modules/landing/ui/sections/faq-section";
import { FooterSection } from "@/modules/landing/ui/sections/footer-section";
import { GoSection } from "@/modules/landing/ui/sections/go-section";
import { HowItWorkSection } from "@/modules/landing/ui/sections/how-it-work-section";
import { NavbarSection } from "@/modules/landing/ui/sections/navbar-section";
import { ProblemSection } from "@/modules/landing/ui/sections/problem-section";
import { StickyBannerDemo } from "@/modules/landing/ui/sections/sticky-banner-section";
import { TestimonialSection } from "@/modules/landing/ui/sections/testimonial-section";




const Page = async () => {
  return (
    <>
      <StickyBannerDemo />
      <NavbarSection />
      <HeroFloat />
      <ProblemSection />
      <BeneficSection />
      <HowItWorkSection />
      <TestimonialSection />
      <FacSection />
      <GoSection />


    </>
  );
};

export default Page;
