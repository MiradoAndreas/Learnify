import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LogIn, Github, Twitter, Linkedin } from "lucide-react";
import Logo from "./Logo";
import SearchInput from "./search-input";
import { NavLinks } from "./nav-links";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[85vw] sm:w-[400px] p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <Logo />
              <SheetTitle className="sr-only">Menu</SheetTitle>
            </div>
          </SheetHeader>

          <div className="flex-1 px-6 py-4 overflow-y-auto">
            <NavLinks isMobile onClick={onClose} className="mb-8" />

            <div className="space-y-4 mb-8">
              <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider">
                Quick Actions
              </h3>
              <Button className="w-full h-12 text-base rounded-xl">
                <LogIn className="w-5 h-5 mr-2" />
                Sign In
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 text-base rounded-xl"
              >
                Get Started
              </Button>
            </div>

            <div className="pt-8 border-t">
              <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider mb-4">
                Connect With Us
              </h3>
              <div className="flex space-x-3">
                <Button variant="outline" size="icon" className="rounded-full">
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Github className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Linkedin className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t bg-muted/20">
            <p className="text-sm text-muted-foreground text-center">
              © 2024 Learnify. All rights reserved.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
