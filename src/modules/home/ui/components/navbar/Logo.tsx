import React from "react";
import { cn } from "@/lib/utils";


interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={cn("flex items-center space-x-3", className)}>
      {/* Logo avec gradient orange */}
      <div className="relative">
        {/* Effet de brillance */}
        <div className="absolute inset-0 bg-linear-to-br from-[#feba46]/20 to-[#ff6b6b]/20 rounded-2xl blur-xl" />

        {/* Conteneur du logo */}
        <div className="relative w-10 h-10 rounded-xl bg-linear-to-br from-[#feba46] to-[#ff8e3c] flex items-center justify-center shadow-lg">
          {/* Remplacer cette div par votre image de logo */}
          <div className="w-8 h-8 flex items-center justify-center">
            {/* Si vous avez une image, utilisez: */}

            {/* Version temporaire avec icône BookOpen */}
            <svg
              className="w-6 h-6 text-white drop-shadow-sm"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>

          {/* Points décoratifs */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-linear-to-br from-[#feba46] to-white rounded-full" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-linear-to-br from-white to-[#ff8e3c] rounded-full" />
        </div>
      </div>

      {/* Texte avec gradient orange */}
      <div className="flex flex-col">
        <span className="text-2xl font-bold bg-linear-to-r from-[#feba46] via-[#ff8e3c] to-[#ff6b6b] bg-clip-text text-transparent tracking-tight">
          Learnify
        </span>
        <span className="text-xs font-medium text-muted-foreground -mt-1">
          Learn smarter
        </span>
      </div>
    </div>
  );
};

export default Logo;
