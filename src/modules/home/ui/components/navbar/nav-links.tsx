import React from "react";
import { Home, BookOpen, Briefcase, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavLink {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface NavLinksProps {
  isMobile?: boolean;
  onClick?: () => void;
  className?: string;
}

export const NavLinks: React.FC<NavLinksProps> = ({
  isMobile = false,
  onClick,
  className,
}) => {
  const links: NavLink[] = [
    { name: "Home", href: "#", icon: <Home className="w-4 h-4" /> },
    { name: "Course", href: "#", icon: <BookOpen className="w-4 h-4" /> },
    { name: "Careers", href: "#", icon: <Briefcase className="w-4 h-4" /> },
    { name: "Blog", href: "#", icon: <FileText className="w-4 h-4" /> },
    { name: "About Us", href: "#", icon: <Users className="w-4 h-4" /> },
  ];

  if (isMobile) {
    return (
      <div className={cn("space-y-2", className)}>
        {links.map((link) => (
          <Button
            key={link.name}
            variant="ghost"
            className="w-full justify-start text-base py-5 px-4 hover:bg-gradient-orange-light hover:text-[#feba46] rounded-xl transition-all"
            onClick={onClick}
          >
            <span className="flex items-center space-x-3">
              <span className="text-[#feba46]">{link.icon}</span>
              <span className="font-medium">{link.name}</span>
            </span>
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("hidden lg:flex items-center space-x-1", className)}>
      {links.map((link) => (
        <Button
          key={link.name}
          variant="ghost"
          className="px-5 py-2.5 hover:bg-gradient-orange-light rounded-xl group relative transition-all duration-300"
        >
          <span className="flex items-center space-x-2.5">
            <span className="text-gray-500 group-hover:text-[#feba46] transition-colors">
              {link.icon}
            </span>
            <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-[#feba46] dark:group-hover:text-[#feba46] transition-colors">
              {link.name}
            </span>
          </span>
          <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 group-hover:w-3/4 h-0.5 bg-linear-to-r from-[#feba46] to-[#ff8e3c] transition-all duration-300 rounded-full" />
        </Button>
      ))}
    </div>
  );
};
