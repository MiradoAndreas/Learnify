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
import { toast } from "sonner";
import { AuthModal } from "@/modules/auth/ui/components/auth-modal";


type AuthMode = "login" | "register";


const mobileNavItems = [
  { name: "Services", link: "/services" },
  { name: "Products", link: "/courses" },
  { name: "Pricing", link: "/pricing" },
];

export function NavbarSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  return (
    <>
      <Navbar className="top-20">
        {/* ===== DESKTOP ===== */}
        <NavBody>
          <NavbarLogo />

          {/* 🔥 MENU HOVER ICI */}
          <DesktopMenu />

          <div className="relative z-50 flex items-center gap-2">
            <NavbarButton variant="secondary" onClick={() => {
              setMode("login")
              setOpen(true)
            }}>Connexion</NavbarButton>
            <NavbarButton variant="gradient" onClick={() => {
              setMode("register")
              setOpen(true)
            }}>S’inscrire</NavbarButton>
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
              <NavbarButton variant="secondary">Connexion</NavbarButton>
              <NavbarButton variant="gradient">S’inscrire</NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
      {/* MODAL */}
      <AuthModal
        open={open}
        mode={mode}
        onModeChange={setMode}
        onOpenChange={setOpen}
      /></>
  );
}
