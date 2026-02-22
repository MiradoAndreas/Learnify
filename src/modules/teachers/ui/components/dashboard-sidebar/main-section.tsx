"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

import { ChartColumnBigIcon, ListIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    title: "Courses",
    url: "/teacher/dashboard",
    icon: ListIcon,
  },
  {
    title: "Analytics",
    url: "/teacher/dashboard/analytics",
    icon: ChartColumnBigIcon,
  },
];

export const MainSection = () => {
  const pathname = usePathname();

  return (
    <SidebarGroup className="p-0">
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url;

            return (
              <SidebarMenuItem key={item.title} className="rounded-none relative">
                {/* Indicateur de page active - barre latérale */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-md" />
                )}

                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  isActive={isActive}
                  className={cn(
                    "rounded-none py-8 px-5 transition-all duration-200",
                    isActive && "bg-accent/50 dark:bg-accent/30"
                  )}
                >
                  <Link

                    href={item.url}
                    className="flex items-center gap-4 w-full"
                  >
                    <item.icon
                      className={cn(
                        "w-30 h-30 transition-colors duration-200",
                        isActive
                          ? "text-primary dark:text-primary"
                          : "text-muted-foreground dark:text-gray-500"
                      )}
                    />
                    <span
                      className={cn(
                        "text-md transition-colors duration-200",
                        isActive
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