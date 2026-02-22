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
    <Sidebar
      className="pt-25 z-40 border-none bg-background"
      collapsible="icon"
    >
      <SidebarHeader className="py-8 flex items-center justify-center bg-background border-b border-border/50">
        <HeaderSection />
      </SidebarHeader>
      <SidebarContent className="bg-background">
        <MainSection />
      </SidebarContent>
      <SidebarFooter className="bg-background border-t border-border/50 p-4">
        {/* Footer content if needed */}
      </SidebarFooter>
    </Sidebar>
  );
};