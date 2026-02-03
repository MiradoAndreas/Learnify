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
          {items.map((item) => (
            <SidebarMenuItem key={item.title} className="rounded-none">
              <SidebarMenuButton
                tooltip={item.title}
                asChild
                isActive={pathname === item.url}
                className="rounded-none py-8 px-5"
              >
                <Link
                  prefetch
                  href={item.url}
                  className={cn(
                    "flex items-center gap-4",
                    pathname === item.url && "bg-amber-400"
                  )}
                >
                  {pathname === item.url ? (
                    <>
                      <item.icon className="w-30 h-30" color="#feba45" />
                    </>
                  ) : (
                    <>
                      <item.icon className="w-30 h-30" />
                    </>
                  )}
                  <span
                    className={cn(
                      "text-md",
                      pathname === item.url && "text-[#feba45]"
                    )}
                  >
                    {item.title}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
