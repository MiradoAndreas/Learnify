import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

import { HomeSidebar } from "../components/home-sidebar";
import { HomeNavbar } from "../components/home-navbar";
interface HomeLayoutProps {
  children: React.ReactNode;
}
export const HomeLayout = ({ children }: HomeLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="w-full">
        <HomeNavbar isTeacher={false} />
        <div className="flex min-h-screen pt-25">
          <HomeSidebar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};
