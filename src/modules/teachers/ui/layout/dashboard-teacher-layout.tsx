import { SidebarProvider } from "@/components/ui/sidebar";
import { HomeNavbar } from "@/modules/home/ui/components/home-navbar";
import { HomeSidebar } from "@/modules/home/ui/components/home-sidebar";
import React from "react";
import { DashboardSidebar } from "../components/dashboard-sidebar";

interface DashboardTeacherLayoutProps {
  children: React.ReactNode;
}

const DashboardTeacherLayout = ({ children }: DashboardTeacherLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="w-full bg-background text-foreground">
        <HomeNavbar isTeacher />
        <div className="flex min-h-screen pt-25">
          <DashboardSidebar />
          <main className="flex-1 overflow-y-auto bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardTeacherLayout;