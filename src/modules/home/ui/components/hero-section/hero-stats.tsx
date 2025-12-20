import React from "react";
import { Users, Award, Clock, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatItem {
  icon: React.ReactNode;
  value: string;
  label: string;
  suffix?: string;
}

interface HeroStatsProps {
  className?: string;
}

export const HeroStats: React.FC<HeroStatsProps> = ({ className }) => {
  const stats: StatItem[] = [
    {
      icon: <Users className="w-5 h-5" />,
      value: "50K+",
      label: "Active Students",
      suffix: "",
    },
    {
      icon: <Award className="w-5 h-5" />,
      value: "500+",
      label: "Courses",
      suffix: "",
    },
    {
      icon: <Clock className="w-5 h-5" />,
      value: "98",
      label: "Completion Rate",
      suffix: "%",
    },
    {
      icon: <Star className="w-5 h-5" />,
      value: "4.9",
      label: "Rating",
      suffix: "/5",
    },
  ];

  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-6", className)}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className="group relative p-6 rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 hover:border-[#feba46]/50 hover:shadow-lg transition-all duration-300"
        >
          {/* Gradient border effect */}
          <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-[#feba46]/0 via-[#feba46]/0 to-[#feba46]/0 group-hover:from-[#feba46]/5 group-hover:via-[#ff8e3c]/5 group-hover:to-[#ff6b6b]/5 transition-all duration-500" />

          <div className="relative">
            {/* Icon */}
            <div className="inline-flex p-3 rounded-xl bg-gradient-orange-light mb-4 group-hover:scale-110 transition-transform">
              <span className="text-[#feba46]">{stat.icon}</span>
            </div>

            {/* Value */}
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </span>
              {stat.suffix && (
                <span className="text-lg text-gray-600 dark:text-gray-400">
                  {stat.suffix}
                </span>
              )}
            </div>

            {/* Label */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {stat.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
