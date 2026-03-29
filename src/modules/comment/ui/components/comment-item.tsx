"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MessageSquareIcon,
  MoreVerticalIcon,
  ThumbsUpIcon,
  Trash2Icon,
} from "lucide-react";

import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { CommentForm } from "./comment-form";
import { CommentReplies } from "./comment-replies";
import { CommentGetManyOutput } from "../../types/comment.type";
import { UserAvatar } from "@/components/ui/user-avatar";
import { authClient } from "@/lib/auth-client";


interface CommentItemProps {
  comment: CommentGetManyOutput["items"][number];
  courseId: string;
  lessonId: string;
  variant?: "reply" | "comment";
}

export const CommentItem = ({
  comment,
  courseId,
  lessonId,
  variant = "comment",
}: CommentItemProps) => {
  const session = authClient.useSession();
  const profile = session?.data?.user;

  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [isRepliesOpen, setIsRepliesOpen] = useState(false);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const remove = useMutation(
    trpc.comments.remove.mutationOptions({
      onSuccess: () => {
        toast.success("Commentaire supprimé");
        queryClient.invalidateQueries({
          queryKey: trpc.comments.getMany.infiniteQueryKey({
            courseId,
            lessonId,
          }),
        });
      },
      onError: () => {
        toast.error("Une erreur est survenue");
      },
    })
  );

  const like = useMutation(
    trpc.commentLikes.like.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.comments.getMany.infiniteQueryKey({
            courseId,
            lessonId,
          }),
        });
      },
      onError: () => {
        toast.error("Une erreur est survenue");
      },
    })
  );

  const handleDelete = () => {
    remove.mutate({
      id: comment.id,
      courseId,
      lessonId
    });
  };

  const handleLike = () => {
    like.mutate({
      commentId: comment.id,
      courseId,
      lessonId
    });
  };

  return (
    <div>
      <div className="flex gap-4">
        <Link href={`/users/${comment.author.id}`}>
          <UserAvatar
            size={variant === "comment" ? "lg" : "sm"}
            imageUrl={comment.author.imageUrl || "/assets/user-placeholder.svg"}
            name={comment.author.name}
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/users/${comment.author.id}`}>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-medium text-sm pb-0.5">
                {comment.author.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                  locale: fr,
                })}
              </span>
            </div>
          </Link>
          <p className="text-sm">{comment.content}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center">
              <Button
                className="size-8"
                size="icon"
                disabled={like.isPending}
                variant="ghost"
                onClick={handleLike}
              >
                <ThumbsUpIcon
                  className={cn(
                    comment.viewerLike && "fill-current text-white"
                  )}
                />
              </Button>
              <span className="text-xs text-muted-foreground">
                {comment.likeCount}
              </span>
            </div>

            {variant === "comment" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={() => setIsReplyOpen(true)}
              >
                Répondre
              </Button>
            )}
          </div>
        </div>

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              {remove.isPending ? <Spinner /> : <MoreVerticalIcon />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setIsReplyOpen(true)}
              className="cursor-pointer"
            >
              <MessageSquareIcon className="size-4 mr-2" />
              Répondre
            </DropdownMenuItem>

            {comment.author.id === profile?.id && (
              <DropdownMenuItem
                onClick={handleDelete}
                className="cursor-pointer text-red-600"
              >
                <Trash2Icon className="size-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isReplyOpen && variant === "comment" && (
        <div className="mt-4 pl-14">
          <CommentForm
            variant="reply"
            parentId={comment.id}
            courseId={courseId}
            lessonId={lessonId}
            onCancel={() => setIsReplyOpen(false)}
            onSuccess={() => {
              setIsReplyOpen(false);
              setIsRepliesOpen(true);
            }}
          />
        </div>
      )}

      {comment.replyCount > 0 && variant === "comment" && (
        <div className="pl-14">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsRepliesOpen(!isRepliesOpen)}
            className="mt-2"
          >
            {isRepliesOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            {comment.replyCount} réponse{comment.replyCount > 1 ? 's' : ''}
          </Button>
        </div>
      )}

      {isRepliesOpen && variant === "comment" && (
        <CommentReplies
          parentId={comment.id}
          courseId={courseId}
          lessonId={lessonId}
        />
      )}
    </div>
  );
};