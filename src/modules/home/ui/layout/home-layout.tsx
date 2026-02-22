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
        <div className="flex flex-1 min-h-screen ">
          <HomeSidebar />
          <main className="flex-1 overflow-y-auto  bg-background  pt-25 ">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};
