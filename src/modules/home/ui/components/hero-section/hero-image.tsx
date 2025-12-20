import React from "react";
import { Play, Zap, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

export const HeroImage = () => {
  return (
    <div>
      <Image src="/banner.png" width={700} height={700} alt="Banner" />
    </div>
  );
};
