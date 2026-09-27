import { FooterSection } from "@/modules/landing/ui/sections/footer-section";
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}
const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      {children} <FooterSection />{" "}
    </>
  );
};

export default Layout;
