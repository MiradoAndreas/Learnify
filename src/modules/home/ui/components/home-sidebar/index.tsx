import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import React from "react";
import { MainSection } from "./main-section";

export const HomeSidebar = () => {
  return (
    <Sidebar
      className="pt-25 z-40 border-none bg-background"
      collapsible="icon"
    >
      <SidebarContent className="bg-background">
        <MainSection />
      </SidebarContent>
    </Sidebar>
  );
};