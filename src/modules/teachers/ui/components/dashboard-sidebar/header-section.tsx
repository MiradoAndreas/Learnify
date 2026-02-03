"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useTRPC } from "@/trpc/client";

export const HeaderSection = () => {
  const trpc = useTRPC();
  const { state } = useSidebar();
  
  const { data: teacher, isLoading, isError } = useQuery(
    trpc.teacher.getMe.queryOptions()
  );

  const teacherInitial = useMemo(() => {
    if (!teacher?.fullName) return "U";
    return teacher.fullName.charAt(0).toUpperCase();
  }, [teacher?.fullName]);

  const teacherImageAlt = useMemo(() => {
    return teacher?.fullName ? `${teacher.fullName}'s profile picture` : "User profile";
  }, [teacher?.fullName]);

  if (isLoading) {
    return <HeaderSkeleton />;
  }

  if (isError || !teacher) {
    return (
      <div className="p-4 text-center">
        <Avatar className="size-[112px] border-2 border-dashed border-muted">
          <AvatarFallback className="bg-muted text-muted-foreground">
            ?
          </AvatarFallback>
        </Avatar>
        <p className="mt-2 text-sm text-muted-foreground">Unable to load profile</p>
      </div>
    );
  }

  // Version sidebar collapsed
  if (state === "collapsed") {
    return (
      <SidebarMenuItem>
        <div className="flex items-center justify-center w-full">
          <Link 
            href="/teachers/current" 
            prefetch={false}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-full"
            title={`${teacher.fullName} - ${teacher.profession}\nClick to view profile`}
          >
            <Avatar className="size-8 hover:scale-105 transition-all duration-200 border-2 border-background shadow-sm">
              <AvatarImage
                src={teacher.image || undefined}
                alt={teacherImageAlt}
                className="object-cover"
              />
              <AvatarFallback className="bg-linear-to-br from-primary to-primary/80 font-semibold text-white">
                {teacherInitial}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </SidebarMenuItem>
    );
  }

  // Version sidebar expanded
  return (
    <div className="flex flex-col items-center p-4 gap-4">
      <Link 
        href="/teachers/current" 
        prefetch={false}
        className="group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-full"
      >
        <div className="absolute inset-0 bg-linear-to-r from-primary/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Avatar className="size-28 border-4 border-background shadow-lg group-hover:scale-105 transition-all duration-300">
          <AvatarImage
            src={teacher.image || undefined}
            alt={teacherImageAlt}
            className="object-cover"
          />
          <AvatarFallback className="bg-linear-to-br from-primary to-primary/80 text-2xl font-bold text-white">
            {teacherInitial}
          </AvatarFallback>
        </Avatar>
        
      </Link>

      <div className="flex flex-col items-center text-center gap-2 w-full">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold tracking-tight line-clamp-1">
            {teacher.fullName}
          </h3>
          <Badge variant="secondary" className="font-normal">
            {teacher.profession}
          </Badge>
        </div>

        <Link
          href="/teachers/current"
          className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors font-medium flex items-center gap-1 group"
        >
          View profile
          <span 
            aria-hidden="true"
            className="inline-block group-hover:translate-x-0.5 transition-transform"
          >
            →
          </span>
        </Link>
      </div>
    </div>
  );
};

const HeaderSkeleton = () => {
  const { state } = useSidebar();

  if (state === "collapsed") {
    return (
      <SidebarMenuItem>
        <div className="flex items-center justify-center w-full">
          <Skeleton className="size-8 rounded-full" />
        </div>
      </SidebarMenuItem>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 gap-4 w-full">
      <Skeleton className="size-28 rounded-full" />
      <div className="flex flex-col items-center gap-2 w-full">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3 mt-1" />
      </div>
    </div>
  );
};