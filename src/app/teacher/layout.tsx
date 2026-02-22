import { Button } from "@/components/ui/button";
import { HomeLayout } from "@/modules/home/ui/layout/home-layout";
import DashboardTeacherLayout from "@/modules/teachers/ui/layout/dashboard-teacher-layout";
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <DashboardTeacherLayout>
      <div className="flex items-center justify-between gap-4 px-4 py-2 bg-background text-foreground">
        {children}
      </div>
    </DashboardTeacherLayout>
  );
};

export default Layout;