"use client";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatarPersonal } from "@/components/user-avatar-personal";
import { authClient } from "@/lib/auth-client";

import { TeacherModeButton } from "@/modules/teachers/ui/components/teacher-mode-gate";
import { LogOutIcon, PanelTopIcon } from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchInput } from "./search-input";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { NavbarButton } from "@/components/ui/resizable-navbar";

interface HomeNavbarProps {
  isTeacher: boolean;
}

export const HomeNavbar = ({ isTeacher }: HomeNavbarProps) => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const session = authClient.useSession();
  const profile = session?.data?.user;
  const isLoading = session?.isPending || false;

  // Détection du montage côté client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Détection du scroll pour l'effet de glassmorphisme
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fonction pour rendre le contenu de la navbar de manière conditionnelle
  const renderNavContent = () => {
    // Pendant le SSR ou le chargement initial, montrer une version squelette
    if (!isMounted || isLoading) {
      return (
        <div className="flex items-center justify-between gap-2 sm:gap-4 w-full">
          {/* Menu and Logo */}
          <div className="flex items-center shrink-0">
            <SidebarTrigger className="lg:flex" />
            <Link href="/" className="flex items-center gap-1 p-2 sm:p-3 md:p-4">
              <Logo />
            </Link>
          </div>

          {/* Search Input skeleton */}
          {!isTeacher && (
            <div className={cn(
              "flex-1 hidden md:block max-w-full md:max-w-[400px] lg:max-w-[600px] px-2"
            )}>
              <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse" />
            </div>
          )}

          {/* Mobile menu button */}
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden ml-auto"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <PanelTopIcon className="h-5 w-5" />
          </Button>

          {/* Avatar skeleton */}
          <div className="hidden lg:flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0">
            <Skeleton className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full" />
          </div>

          {/* Mobile menu skeleton (optionnel) */}
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border shadow-lg p-4 lg:hidden">
              <div className="flex flex-col gap-4">
                <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse" />
                <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse" />
                <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse" />
              </div>
            </div>
          )}
        </div>
      );
    }

    // Version pour utilisateur non connecté
    if (!profile) {
      return (
        <div className="flex items-center justify-between gap-2 sm:gap-4 w-full">
          {/* Menu and Logo */}
          <div className="flex items-center shrink-0">
            <SidebarTrigger className="lg:flex" />
            <Link href="/" className="flex items-center gap-1 p-2 sm:p-3 md:p-4">
              <Logo />
            </Link>
          </div>

          {/* Search Input */}
          {!isTeacher && (
            <div className={cn(
              "flex-1 transition-all duration-300",
              "hidden md:block max-w-full md:max-w-[400px] lg:max-w-[600px]",
              "px-2"
            )}>
              <SearchInput />
            </div>
          )}

          {/* Mobile menu button */}
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden ml-auto"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <PanelTopIcon className="h-5 w-5" />
          </Button>

          {/* Auth buttons */}
          <div className="flex items-center gap-x-2">
            <Link href="/login">
              <NavbarButton
                variant="secondary"
                asChild={true}
                className="hidden sm:flex"
              >
                Connexion
              </NavbarButton>
            </Link>
            <Link href="/register">
              <NavbarButton
                variant="gradient"
                className="hidden sm:flex"
                asChild={true}
              >
                S'inscrire
              </NavbarButton>
            </Link>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border shadow-lg p-4 lg:hidden animate-in slide-in-from-top duration-300">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4">
                  <SearchInput />
                  <Link href="/login">
                    <NavbarButton variant="secondary" asChild={true} className="w-full">
                      Connexion
                    </NavbarButton>
                  </Link>
                  <Link href="/register">
                    <NavbarButton variant="gradient" asChild={true} className="w-full">
                      S'inscrire
                    </NavbarButton>
                  </Link>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Fermer
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Version pour utilisateur connecté
    return (
      <div className="flex items-center justify-between gap-2 sm:gap-4 w-full">
        {/* Menu and Logo */}
        <div className="flex items-center shrink-0">
          <SidebarTrigger className="lg:flex" />
          <Link href="/" className="flex items-center gap-1 p-2 sm:p-3 md:p-4">
            <Logo />
          </Link>
        </div>

        {/* Search Input */}
        {!isTeacher && (
          <div className={cn(
            "flex-1 transition-all duration-300",
            "max-w-full md:max-w-[400px] lg:max-w-[600px]",
            "px-2"
          )}>
            <SearchInput />
          </div>
        )}

        {/* Mobile menu button */}
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden ml-auto"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <PanelTopIcon className="h-5 w-5" />
        </Button>

        {/* User section - desktop */}
        <div className={cn(
          "shrink-0 items-center gap-2 sm:gap-3 md:gap-4",
          "hidden lg:flex"
        )}>
          {!isTeacher ? (
            <TeacherModeButton />
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary hover:bg-primary/10"
              asChild
            >
              <Link href="/home" className="flex gap-2 items-center">
                <LogOutIcon className="h-4 w-4" />
                <span className="hidden xl:inline">Exit teacher mode</span>
                <span className="xl:hidden">Exit</span>
              </Link>
            </Button>
          )}

          <UserAvatarPersonal
            name={profile.name}
            userId={profile.id}
            size="lg"
            email={profile.email}
            imageUrl={profile.image}
            onClickLogout={() => {
              authClient.signOut();
              router.push("/");
            }}
            className="border-2 border-border hover:border-primary transition-colors"
          />
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border shadow-lg p-4 lg:hidden animate-in slide-in-from-top duration-300">
            <div className="flex flex-col gap-4">
              {!isTeacher ? (
                <div className="flex justify-center">
                  <TeacherModeButton />
                </div>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full justify-center text-muted-foreground hover:text-primary hover:bg-primary/10"
                  asChild
                >
                  <Link href="/home" className="flex gap-2 items-center">
                    <LogOutIcon className="h-4 w-4" />
                    <span>Exit teacher mode</span>
                  </Link>
                </Button>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-3">
                  <UserAvatarPersonal
                    name={profile.name}
                    userId={profile.id}
                    email={profile.email}
                    imageUrl={profile.image}
                    onClickLogout={() => {
                      authClient.signOut();
                      router.push("/");
                      setIsMobileMenuOpen(false);
                    }}
                    className="border-2 border-border"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground line-clamp-1">
                      {profile.name}
                    </span>
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {profile.email}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 h-16 md:h-20 lg:h-25 flex items-center px-2 sm:px-4 md:px-6 z-50 transition-all duration-300",
        "bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/80",
        isScrolled
          ? "border-b border-border/50 shadow-sm"
          : "border-b border-transparent"
      )}
    >
      {renderNavContent()}
    </nav>
  );
};