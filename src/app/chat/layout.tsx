import { AppSidebar } from "@/modules/chat-ai/ui/layouts/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
