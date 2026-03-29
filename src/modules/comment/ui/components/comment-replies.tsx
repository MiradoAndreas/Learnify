"use client";

import { Spinner } from "@/components/ui/spinner";

import { useTRPC } from "@/trpc/client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { CommentItem } from "./comment-item";
import { Button } from "@/components/ui/button";
import { CornerDownRightIcon } from "lucide-react";
import { DEFAULT_COURSE_LIMIT } from "@/constants";

interface CommentRepliesProps {
  parentId: string;
  courseId: string;
  lessonId: string;
}

export const CommentReplies = ({ parentId, courseId, lessonId }: CommentRepliesProps) => {
  const trpc = useTRPC();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery(
    trpc.comments.getMany.infiniteQueryOptions(
      {
        limit: DEFAULT_COURSE_LIMIT,
        courseId,
        lessonId,
        parentId,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    )
  );

  if (isLoading) {
    return (
      <div className="pl-14 flex items-center justify-center">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    );
  }

  const replies = data?.pages.flatMap((page) => page.items) ?? [];

  if (replies.length === 0) {
    return null;
  }

  return (
    <div className="pl-14">
      <div className="flex flex-col gap-4 mt-2">
        {replies.map((reply) => (
          <CommentItem
            key={reply.id}
            comment={reply}
            courseId={courseId}
            lessonId={lessonId}
            variant="reply"
          />
        ))}
      </div>

      {hasNextPage && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="mt-2"
        >
          <CornerDownRightIcon className="size-4 mr-2" />
          Voir plus de réponses
        </Button>
      )}
    </div>
  );
};