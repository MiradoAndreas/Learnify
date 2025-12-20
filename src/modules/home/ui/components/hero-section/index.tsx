import React from "react";

import { cn } from "@/lib/utils";
import { HeroContent } from "./hero-content";
import { HeroStats } from "./hero-stats";
import { HeroImage } from "./hero-image";

interface HeroSectionProps {
  className?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ className }) => {
  return (
    <section className={cn("relative overflow-hidden", className)}>
      {/* Background gradients */}
      <div className="absolute inset-0 bg-linear-to-br from-orange-50/30 via-white to-indigo-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/20" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-linear-to-r from-[#feba46]/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-linear-to-l from-indigo-500/10 to-transparent rounded-full blur-3xl" />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-12 lg:gap-20">
          {/* Left side - Content */}
          <div className="flex-1 max-w-2xl">
            <HeroContent />
          </div>

          {/* Right side - Image */}
          <div className="flex-1 max-w-2xl">
            <HeroImage />
          </div>
        </div>
      </div>
    </section>
  );
};
