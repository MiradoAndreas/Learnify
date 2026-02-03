"use client";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatarPersonal } from "@/components/user-avatar-personal";
import { authClient } from "@/lib/auth-client";


import { TeacherModeButton } from "@/modules/teachers/ui/components/teacher-mode-gate";
import { useTRPC } from "@/trpc/client";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { LogOutIcon } from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchInput } from "./search-input";
import { Logo } from "@/components/logo";


interface HomeNavbarProps {
  isTeacher: boolean;
}

const HomeNavbarSkeleton = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-25 bg-white flex items-center px-2 pr-5 z-50">
      <div className="flex items-center gap-4 w-full justify-between">
        {/** Menu and Logo section skeleton */}
        <div className="flex items-center shrink-0">
          {/* Sidebar trigger skeleton */}
          <Skeleton className="w-10 h-10 rounded-md" />

          {/* Logo skeleton */}
          <div className="p-4 flex items-center gap-1">
            <Skeleton className="w-8 h-8 rounded-md" />
            <Skeleton className="hidden md:block w-32 h-8 rounded-md" />
          </div>
        </div>

        {/** User section skeleton */}
        <div className="shrink-0 items-center flex gap-4">
          {/* Teacher Mode button skeleton */}
          <Skeleton className="hidden md:block w-32 h-10 rounded-md" />

          {/* User avatar skeleton */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end gap-1">
              <Skeleton className="w-24 h-4 rounded" />
              <Skeleton className="w-16 h-3 rounded" />
            </div>
            <Skeleton className="w-12 h-12 rounded-full" />
          </div>
        </div>
      </div>
    </nav>
  )
}

const HomeNavbarError = () => {
  return (
    <div>
      HomeNavbarError...
    </div>
  )
}



export const HomeNavbar = ({ isTeacher }: HomeNavbarProps) => {
  const trpc = useTRPC()
  const router = useRouter()
  const { data: profile, isLoading } = useQuery(
    trpc.user.getProfile.queryOptions()
  );
  if (!profile) {
    return <HomeNavbarSkeleton />
  }
  return (
    <nav className="fixed top-0 left-0 right-0 h-25 bg-white flex items-center px-2 pr-5 z-50">
      <div className="flex items-center gap-4 w-full justify-between">
        {/** Menu and Logo */}
        <div className="flex items-center shrink-0">
          <SidebarTrigger />
          <Link href="/" prefetch>
            <div className="p-4 flex items-center gap-1">
              <Logo />
            </div>
          </Link>
        </div>

        <SearchInput />



        {/** Icon for the user */}
        <div className="shrink-0 items-center flex gap-4">
          {!isTeacher ? (
            <TeacherModeButton />
          ) : (
            <Button >
              <Link prefetch href="/home" className="flex gap-2 items-center">
                <LogOutIcon /> <span>Exit teacher mode</span>
              </Link>
            </Button>
          )}
          {isLoading ? (
            <Skeleton className="w-12 h-12 rounded-full" />
          ) : (
            <UserAvatarPersonal
              name={profile.name}
              userId={profile.id}
              size="lg"
              email={profile.email}
              imageUrl={profile.image} // ✅ toujours à jour
              onClickLogout={() => {
                authClient.signOut();
                router.push("/");
              }}
            />
          )}
        </div>
      </div>
    </nav>
  );
};
