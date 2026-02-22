"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

import {
  FlameIcon,
  HomeIcon,
  LayoutDashboardIcon,
  MapIcon,
  PlaySquareIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    title: "My courses",
    url: "/home/my-courses",
    icon: LayoutDashboardIcon,
  },
  {
    title: "All Courses",
    url: "/home",
    icon: MapIcon,
    auth: true,
  },
];

export const MainSection = () => {
  const pathname = usePathname();
  const isActive = (url: string) => pathname === url;

  return (
    <SidebarGroup className="p-0">
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = isActive(item.url);

            return (
              <SidebarMenuItem key={item.title} className="rounded-none">
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  isActive={active}
                  className={cn(
                    "rounded-none py-8 px-5 transition-colors",
                    active && "bg-accent dark:bg-accent/50"
                  )}
                >
                  <Link href={item.url} className="flex items-center gap-4">
                    <item.icon
                      className={cn(
                        "w-30 h-30 transition-colors",
                        active
                          ? "text-primary dark:text-primary"
                          : "text-muted-foreground dark:text-gray-500"
                      )}
                    />
                    <span
                      className={cn(
                        "text-md transition-colors",
                        active
                          ? "text-primary dark:text-primary font-medium"
                          : "text-foreground dark:text-gray-300"
                      )}
                    >
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};