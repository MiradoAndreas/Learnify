"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { CoinsIcon, MessageSquareIcon, SquarePenIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { Empty, EmptyDescription } from "@/components/ui/empty";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserMenu } from "@/components/user-menu";
import { useTRPC } from "@/trpc/client";

import { DiscussionMenu } from "../components/discussion-menu";

function formatCredits(credits: number) {
  return credits.toLocaleString("en-US");
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  const createConversation = useMutation(
    trpc.chat.create.mutationOptions({
      onSuccess: (conversation) => {
        queryClient.invalidateQueries({ queryKey: trpc.chat.list.queryKey() });
        router.push(`/chat/${conversation!.id}`);
      },
    }),
  );

  // Mocked balance — no billing behind it yet.
  const credits = 1250;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex-row items-center justify-between group-data-[collapsible=icon]:justify-center">
        <Link
          href="/chat"
          className="flex items-center gap-2 group-data-[collapsible=icon]:hidden"
        >
          <Image alt="Logo" src="/logos/logo.svg" width={34} height={34} />
          <span className="font-logo text-base">Mianatr&apos;AI</span>
        </Link>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => createConversation.mutate({})}
                disabled={createConversation.isPending}
              >
                <SquarePenIcon />
                <span>New chat</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Recents</SidebarGroupLabel>
          <SidebarGroupContent>
            <ErrorBoundary fallback={<ConversationListError />}>
              <Suspense fallback={<ConversationListSkeleton />}>
                <ConversationList />
              </Suspense>
            </ErrorBoundary>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <CoinsIcon />
              <span>Credits</span>
            </SidebarMenuButton>
            <SidebarMenuBadge>{formatCredits(credits)}</SidebarMenuBadge>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="flex items-center px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <UserMenu />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function ConversationListSkeleton() {
  return (
    <SidebarMenu className="group-data-[collapsible=icon]:hidden">
      {Array.from({ length: 4 }).map((_, i) => (
        <SidebarMenuItem key={i} className="px-2 py-1">
          <Skeleton className="h-7 w-full" />
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

function ConversationListError() {
  return (
    <Empty className="border p-2 group-data-[collapsible=icon]:hidden">
      <EmptyDescription className="text-xs">
        Couldn&apos;t load your conversations.
      </EmptyDescription>
    </Empty>
  );
}

/**
 * The active row is derived from the URL (`usePathname`), not local state —
 * the same reasoning the original `GameMenu` used for `isActive`: it's what
 * survives a refresh, a deep link, or the browser's back button, which a
 * piece of component state never would.
 */
function ConversationList() {
  const trpc = useTRPC();
  const pathname = usePathname();
  const { data: conversations } = useSuspenseQuery(
    trpc.chat.list.queryOptions(),
  );

  if (conversations.length === 0) {
    return (
      <Empty className="border p-2 group-data-[collapsible=icon]:hidden">
        <EmptyDescription className="text-xs">
          Your conversations will live here.
        </EmptyDescription>
      </Empty>
    );
  }

  return (
    <>
      <SidebarMenu className="group-data-[collapsible=icon]:hidden">
        {conversations.map((conversation) => (
          <SidebarMenuItem key={conversation.id}>
            <SidebarMenuButton
              asChild
              isActive={pathname === `/chat/${conversation.id}`}
            >
              <Link href={`/chat/${conversation.id}`}>
                <span>{conversation.title}</span>
              </Link>
            </SidebarMenuButton>
            <DiscussionMenu
              discussionId={conversation.id}
              title={conversation.title}
              trigger={<SidebarMenuAction showOnHover />}
            />
          </SidebarMenuItem>
        ))}
      </SidebarMenu>

      <SidebarMenu className="hidden group-data-[collapsible=icon]:flex">
        <SidebarMenuItem>
          <Popover>
            <PopoverTrigger asChild>
              <SidebarMenuButton>
                <MessageSquareIcon />
                <span>Recents</span>
              </SidebarMenuButton>
            </PopoverTrigger>
            <PopoverContent
              side="right"
              align="start"
              className="w-56 gap-1.5 p-1.5"
            >
              <PopoverHeader className="px-2 pt-1">
                <PopoverTitle className="text-xs text-muted-foreground">
                  Recents
                </PopoverTitle>
              </PopoverHeader>
              <SidebarMenu>
                {conversations.map((conversation) => (
                  <SidebarMenuItem key={conversation.id}>
                    <PopoverClose asChild>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === `/chat/${conversation.id}`}
                      >
                        <Link href={`/chat/${conversation.id}`}>
                          <span>{conversation.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </PopoverClose>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </PopoverContent>
          </Popover>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}
