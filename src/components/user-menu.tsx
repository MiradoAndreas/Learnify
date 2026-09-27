"use client";

import { LogOutIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";

function getInitials(name: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Account menu for the sidebar footer — same trigger/dropdown shape as
 * before, now backed by the real session instead of a mock user. No
 * organization concept: this app has none, unlike the Clerk setup the
 * earlier mock was modeled on.
 */
export function UserMenu() {
  const router = useRouter();
  const session = authClient.useSession();
  const profile = session?.data?.user;
  const isLoading = session?.isPending ?? false;

  // Same footprint the trigger normally takes, so the footer doesn't jump
  // around while the session is still resolving.
  if (isLoading || !profile) {
    return <Skeleton className="size-8 shrink-0 rounded-full" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="shrink-0 outline-none">
          <Avatar className="size-8">
            <AvatarImage src={profile.image ?? undefined} alt={profile.name} />
            <AvatarFallback className="bg-primary text-xs font-medium text-primary-foreground">
              {getInitials(profile.name)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="truncate text-sm font-medium">{profile.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {profile.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/home/manage-account">
            <SettingsIcon />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            authClient.signOut();
            router.push("/");
          }}
        >
          <LogOutIcon />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
