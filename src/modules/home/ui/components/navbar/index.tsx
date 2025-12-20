"use client";
import React, { useState, useEffect } from "react";
import { Menu, LogIn, Sparkles, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";

import { cn } from "@/lib/utils";

import SearchInput from "./search-input";

import { NavLinks } from "./nav-links";
import { MobileMenu } from "./mobile-menu";

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300 ease-out",
          isScrolled
            ? "bg-white/60 dark:bg-gray-900/80 backdrop-blur-2xl border-b shadow-md"
            : "bg-transparent"
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Logo />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center flex-1 justify-center">
              <NavLinks />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
              {/* Search Button (Mobile) */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* Search Input (Desktop) */}
              <div className="hidden lg:block">
                <SearchInput />
              </div>

              {/* Get Started Button */}
              <Button variant="outline">
                <Sparkles className="w-4 h-4" />
                <span>Get Started</span>
              </Button>

              {/* Login Button */}
              <Button
                variant="ghost"
                className="hidden lg:flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-[#feba46] dark:hover:text-[#feba46]"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Search Input (Mobile - Expanded) */}
          {showSearch && (
            <div className="lg:hidden py-3 animate-in slide-in-from-top duration-200">
              <SearchInput isMobile />
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
};
