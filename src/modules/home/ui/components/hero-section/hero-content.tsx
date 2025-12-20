import React from "react";
import { CheckCircle, PlayCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FeatureItem {
  text: string;
  icon: React.ReactNode;
}

interface HeroContentProps {
  className?: string;
}

export const HeroContent: React.FC<HeroContentProps> = ({ className }) => {
  const features: FeatureItem[] = [
    {
      text: "Formation complète",
      icon: <CheckCircle className="w-5 h-5" />,
    },
    {
      text: "Professeur malgache",
      icon: <CheckCircle className="w-5 h-5" />,
    },
    {
      text: "Accès au cours illimité après vente",
      icon: <CheckCircle className="w-5 h-5" />,
    },
    {
      text: "Obtenir des mis à jour sans payer",
      icon: <CheckCircle className="w-5 h-5" />,
    },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Badge */}
      <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-orange-light border border-[#feba46]/20 backdrop-blur-sm">
        <span className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#feba46] animate-pulse" />
          <span className="text-sm font-medium text-[#feba46]">
            🎉 Rejoignez 10000+ et venez booster vos compétences
          </span>
        </span>
      </div>

      {/* Main Heading */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight">
        <span className="block text-gray-900 dark:text-white">
          Apprendre en autodidacte devient un jeu d'enfant
        </span>
        <span className="block bg-linear-to-r from-[#feba46] via-[#ff8e3c] to-[#ff6b6b] bg-clip-text text-transparent mt-2">
          peu importe quelle domaine
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
        Transformez votre envie d'apprendre en compétence rare et dominer le
        marché de travail avec votre talent. Et tous cela sans déplacer de votre
        maison
      </p>

      {/* Features List */}
      <div className="space-y-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 group cursor-pointer"
          >
            <div className="shrink-0 w-8 h-8 rounded-lg bg-gradient-orange-light flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-[#feba46]">{feature.icon}</span>
            </div>
            <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-[#feba46] transition-colors">
              {feature.text}
            </span>
          </div>
        ))}
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <Button size="lg" className="rounded-xl">
          <span className="flex items-center space-x-2">
            <span>Start Learning Free</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </span>
        </Button>
      </div>
    </div>
  );
};
