"use client";
import React, { useState, useEffect } from "react";
import { Menu, LogIn, Sparkles, Search, LogInIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";

import { cn } from "@/lib/utils";

import SearchInput from "./search-input";

import { NavLinks } from "./nav-links";
import { MobileMenu } from "./mobile-menu";
import { AuthModal } from "@/modules/auth/ui/components/auth-modal";
import { authClient } from "@/lib/auth-client";
import { UserAvatarPersonal } from "@/components/user-avatar-personal";
import { Skeleton } from "@/components/ui/skeleton";

export const Navbar: React.FC = () => {
  // * data from the session of the user
  const { data, isPending } = authClient.useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
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

              {/* Login Button */}

              {data && (
                <>
                  <UserAvatarPersonal
                    name={data.user.name}
                    size="lg"
                    imageUrl={data.user.image}
                    onClickLogout={() => {
                      authClient.signOut();
                    }}
                  />
                </>
              )}
              {!isPending && !data && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMode("login");
                      setIsOpen(true);
                    }}
                  >
                    <LogInIcon className="w-4 h-4" />
                    <span>Login</span>
                  </Button>
                </>
              )}
              {isPending && <Skeleton className="w-10 h-10 rounded-full" />}
              <AuthModal
                open={isOpen}
                mode={mode}
                onModeChange={setMode}
                onOpenChange={setIsOpen}
              />

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

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
};
