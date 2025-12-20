import { DescriptionSection } from "@/modules/home/ui/components/description-section";
import { FaqAccordion } from "@/modules/home/ui/components/faq";
import { Footer } from "@/modules/home/ui/components/footer";
import { HeroSection } from "@/modules/home/ui/components/hero-section";
import { Navbar } from "@/modules/home/ui/components/navbar";
import { AnimatedTestimonialsDemo } from "@/modules/home/ui/components/testimonials";

const Page = () => {
  return (
    <>
      <Navbar />
      <HeroSection />
      <DescriptionSection />
      <AnimatedTestimonialsDemo />
      <FaqAccordion />
      <Footer />
    </>
  );
};

export default Page;
