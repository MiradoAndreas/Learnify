"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EllipsisIcon, PencilLineIcon, Trash2Icon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cloneElement, isValidElement, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useTRPC } from "@/trpc/client";

const TITLE_MAX_LENGTH = 60;

/**
 * What can be done to a conversation: rename it, or throw it away. Same
 * shape as before — a plain `Dialog` for renaming, an `AlertDialog` for the
 * irreversible delete — now wired to `trpc.chat.rename` / `trpc.chat.remove`
 * instead of the mock. The sidebar list itself lives in react-query's cache,
 * so both mutations just invalidate `trpc.chat.list` on success rather than
 * reporting back through callback props.
 */
export function DiscussionMenu({
  discussionId,
  title,
  trigger,
}: {
  discussionId: string;
  title: string;
  trigger?: React.ReactElement;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  const [dialog, setDialog] = useState<"rename" | "delete" | null>(null);
  const [name, setName] = useState(title);

  const rename = useMutation(
    trpc.chat.rename.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.chat.list.queryKey() });
        setDialog(null);
      },
    }),
  );

  const remove = useMutation(
    trpc.chat.remove.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.chat.list.queryKey() });
        // Only navigate away if the conversation being deleted is the one
        // currently open — deleting a row from the sidebar shouldn't move
        // the player elsewhere.
        if (pathname === `/chat/${discussionId}`) {
          router.push("/chat");
        }
      },
    }),
  );

  const isPending = rename.isPending || remove.isPending;
  const error = rename.error?.message ?? remove.error?.message ?? null;

  // The box starts from what the conversation is called now, every time — a
  // name abandoned in a previous open should not come back on the next one.
  function openDialog(next: "rename" | "delete") {
    setName(title);
    rename.reset();
    remove.reset();
    setDialog(next);
  }

  function handleOpenChange(open: boolean) {
    if (!open && !isPending) {
      setDialog(null);
    }
  }

  function handleRename(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    rename.mutate({ id: discussionId, title: trimmed });
  }

  function handleDelete() {
    remove.mutate({ id: discussionId });
  }

  const trimmed = name.trim();

  // Radix's DropdownMenuTrigger merges its props onto a single `asChild`
  // element rather than injecting extra children — the icon has to end up
  // *inside* whichever element ends up rendered, whether that's the default
  // Button or a caller-supplied trigger like `SidebarMenuAction`.
  const menuTrigger =
    trigger && isValidElement(trigger) ? (
      cloneElement(
        trigger as React.ReactElement<{ "aria-label"?: string }>,
        { "aria-label": `Options for ${title}` },
        <EllipsisIcon />,
      )
    ) : (
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Options for ${title}`}
      >
        <EllipsisIcon />
      </Button>
    );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{menuTrigger}</DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => openDialog("rename")}>
            <PencilLineIcon />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => openDialog("delete")}
          >
            <Trash2Icon />
            Move to trash
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialog === "rename"} onOpenChange={handleOpenChange}>
        <DialogContent>
          <form onSubmit={handleRename} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>Rename conversation</DialogTitle>
              <DialogDescription>
                This is the name in the sidebar and above the conversation. It
                does not change its content.
              </DialogDescription>
            </DialogHeader>
            <Field>
              <FieldLabel htmlFor="conversation-title">Name</FieldLabel>
              <Input
                id="conversation-title"
                name="title"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={TITLE_MAX_LENGTH}
                disabled={rename.isPending}
                autoFocus
              />
            </Field>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={!trimmed || rename.isPending}>
                {rename.isPending && <Spinner />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={dialog === "delete"} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <Trash2Icon className="text-destructive" />

            <AlertDialogTitle>Move “{title}” to trash?</AlertDialogTitle>
            <AlertDialogDescription>
              The conversation and its messages go with it. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={remove.isPending}
            >
              {remove.isPending && <Spinner />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
