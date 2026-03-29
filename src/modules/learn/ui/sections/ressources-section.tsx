"use client"

import { ExpandableRichText } from "@/modules/teachers/courses/lessons/ui/components/expanded-rich-text";
import { LessonAttachments } from "@/modules/teachers/courses/lessons/ui/components/lesson-attachments";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface RessourcesSectionProps {
  courseId: string;
  lessonId: string
}

const RessourcesSectionSkeleton = () => {
  return (
    <div>
      Loading...
    </div>
  )
}

const RessourcesSectionError = () => {
  return (
    <div>
      Error
    </div>
  )
}

export const RessourcesSection = ({
  courseId,
  lessonId
}: RessourcesSectionProps) => {
  return (
    <Suspense fallback={<RessourcesSectionSkeleton />}>
      <ErrorBoundary fallback={<RessourcesSectionError />}>
        <RessourcesSectionSuspense courseId={courseId} lessonId={lessonId} />
      </ErrorBoundary>
    </Suspense>
  )
}

const RessourcesSectionSuspense = ({
  courseId,
  lessonId
}: RessourcesSectionProps) => {
  const trpc = useTRPC()

  const { data: lessonDetails } = useSuspenseQuery(
    trpc.course.getLessonDetails.queryOptions({
      courseId,
      lessonId
    })
  )
  return (
    <div className="m-5 flex gap-y-5 flex-col">

      <div>
        <h1 className="text-3xl font-bold ">Description</h1>
      </div>
      <div>
        {lessonDetails.description && <ExpandableRichText content={lessonDetails.description} className=" dark:text-white" maxLines={5} />}
      </div>
    </div>
  )
}
