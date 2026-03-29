"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { Spinner } from "@/components/ui/spinner";

import { CommentForm } from "./comment-form";
import { CommentItem } from "./comment-item";
import { useTRPC } from "@/trpc/client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { DEFAULT_COURSE_LIMIT } from "@/constants";
import { authClient } from "@/lib/auth-client";

interface CommentsSectionProps {
  courseId: string;
  lessonId: string;
}

export const CommentsSection = ({ courseId, lessonId }: CommentsSectionProps) => {
  return (
    <Suspense fallback={<CommentsSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error loading comments</p>}>
        <CommentSectionSuspense courseId={courseId} lessonId={lessonId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const CommentsSectionSkeleton = () => {
  return (
    <div className="mt-6 flex justify-center items-center">
      <Spinner className="size-7 text-muted-foreground" />
    </div>
  );
};

const CommentSectionSuspense = ({ courseId, lessonId }: CommentsSectionProps) => {
  const trpc = useTRPC();



  const {
    data: comments,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useSuspenseInfiniteQuery(
    trpc.comments.getMany.infiniteQueryOptions(
      {
        courseId,
        lessonId,
        limit: DEFAULT_COURSE_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    )
  );

  console.log(comments)



  return (
    <div className="mt-6">
      <div className="flex flex-col gap-6">
        <h1 className="text-xl font-bold">
          {comments.pages[0].totalCount} Commentaire{comments.pages[0].totalCount > 1 ? 's' : ''}
        </h1>
        <CommentForm courseId={courseId} lessonId={lessonId} />
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {comments.pages
          .flatMap((page) => page.items)
          .map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              courseId={courseId}
              lessonId={lessonId}
            />
          ))}
        <InfiniteScroll
          isManual={true}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          textInEnd="Vous avez atteind le fin de la liste des commentaires"
        />
      </div>
    </div>
  );
};