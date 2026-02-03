import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

import { MainSection } from "./main-section";
import { HeaderSection } from "./header-section";

export const DashboardSidebar = () => {
  return (
    <Sidebar className="pt-25 z-40 border-none" collapsible="icon">
      <SidebarHeader className="py-8 flex items-center justify-center bg-white">
        <HeaderSection />
      </SidebarHeader>
      <SidebarContent className="bg-background">
        <MainSection />
      </SidebarContent>
    </Sidebar>
  );
};
