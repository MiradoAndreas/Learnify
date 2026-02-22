"use client";

import { useState } from "react";
import {
  Navbar,
  NavBody,
  NavbarLogo,
  NavbarButton,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
} from "@/components/ui/resizable-navbar";
import { DesktopMenu } from "../components/desktop-menu";
import { AuthModal } from "@/modules/auth/ui/components/auth-modal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { UserAvatarPersonal } from "@/components/user-avatar-personal";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";

import { toast } from "sonner";
import { createAuthClient } from "better-auth/react";
import Link from "next/link";



type AuthMode = "login" | "register";

const mobileNavItems = [
  { name: "Services", link: "/services" },
  { name: "Products", link: "/courses" },
  { name: "Pricing", link: "/pricing" },
];

export function NavbarSection() {

  // Récupérer le session de l'utilisateur qui vient de better auth

  const session = authClient.useSession()

  const profile = session?.data?.user



  const trpc = useTRPC();
  const [isOpen, setIsOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");



  const isAuthenticated = !!profile;
  const hasProfile = !!profile?.id;

  const handleLoginClick = () => {
    setMode("login");
    setOpen(true);
  };

  const handleRegisterClick = () => {
    setMode("register");
    setOpen(true);
  };
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    toast.success("Déconnecté avec succès")
    try {
      await authClient.signOut();

      await queryClient.invalidateQueries({
        queryKey: trpc.user.getProfile.queryKey()
      })

    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };



  return (
    <>
      <Navbar className="top-20">
        {/* ===== DESKTOP ===== */}
        <NavBody>
          <NavbarLogo />
          <DesktopMenu />

          <div className="relative z-50 flex items-center gap-2">
            {isAuthenticated ? (
              // Utilisateur connecté
              <div className="flex items-center gap-4">
                {hasProfile ? (
                  // Profil complet - Affichage normal
                  <>
                    <Link href="/home">

                      <NavbarButton
                        variant="secondary"
                        asChild={true}
                        className="hidden sm:flex"
                      >

                        Tableau de bord

                      </NavbarButton>
                    </Link>
                    <UserAvatarPersonal
                      name={profile.name || profile.email}
                      email={profile.email}
                      imageUrl={profile.image}
                      onClickLogout={handleLogout}
                      userId={profile.id}
                    />
                  </>

                ) : (
                  // Connecté mais profil incomplet
                  <div className="flex items-center gap-x-4">
                    <NavbarButton
                      variant="secondary"
                      href="/complete-profile"

                      className="hidden sm:flex"
                    >
                      Compléter le profil
                    </NavbarButton>
                    <UserAvatarPersonal
                      name={profile.email}
                      email={profile.email}
                      imageUrl={null}
                      onClickLogout={handleLogout}
                    />
                  </div>
                )}
              </div>
            ) : (
              // Utilisateur non connecté
              <>
                <NavbarButton
                  variant="secondary"
                  onClick={handleLoginClick}
                  className="hidden sm:flex"
                >
                  Connexion
                </NavbarButton>
                <NavbarButton
                  variant="gradient"
                  onClick={handleRegisterClick}
                >
                  S'inscrire
                </NavbarButton>
              </>
            )}
          </div>
        </NavBody>

        {/* ===== MOBILE ===== */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isOpen}
              onClick={() => setIsOpen(!isOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
            {mobileNavItems.map((item) => (
              <a
                key={item.name}
                href={item.link}
                onClick={() => setIsOpen(false)}
                className="w-full rounded-md px-4 py-2 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                {item.name}
              </a>
            ))}

            <div className="mt-4 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  {/* Boutons pour mobile */}
                  {hasProfile ? (
                    <Link href="/home">
                      <NavbarButton
                        variant="secondary"
                        asChild={true}

                      >
                        Tableau de bord
                      </NavbarButton>
                      <NavbarButton
                        variant="secondary"
                        href="/profile"
                        onClick={() => setIsOpen(false)}
                      >
                        Mon profil
                      </NavbarButton>
                    </Link>
                  ) : (
                    <NavbarButton
                      variant="secondary"
                      href="/complete-profile"
                      onClick={() => setIsOpen(false)}
                    >
                      Compléter le profil
                    </NavbarButton>
                  )}

                  {/* Affichage des infos utilisateur dans le menu mobile */}
                  <div className="px-4 py-3 border-t">
                    <div className="flex items-center gap-3">
                      <UserAvatarPersonal
                        name={profile.name || profile.email}
                        email={profile.email}
                        imageUrl={profile.image}
                        size="sm"
                        onClickLogout={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {profile.name || profile.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {profile.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <NavbarButton
                    variant="secondary"
                    onClick={() => {
                      handleLoginClick();
                      setIsOpen(false);
                    }}
                  >
                    Connexion
                  </NavbarButton>
                  <NavbarButton
                    variant="gradient"
                    onClick={() => {
                      handleRegisterClick();
                      setIsOpen(false);
                    }}
                  >
                    S'inscrire
                  </NavbarButton>
                </>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      {/* MODAL - seulement si non connecté */}
      {!isAuthenticated && (
        <AuthModal
          open={open}
          mode={mode}
          onModeChange={setMode}
          onOpenChange={setOpen}
        />
      )}
    </>
  );
}