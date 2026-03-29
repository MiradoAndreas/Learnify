"use client"
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface LearningSectionProps {
  courseId: string;
  lessonId: string | undefined;
}

export const LearningSection = ({
  courseId,
  lessonId
}: LearningSectionProps) => {

  const router = useRouter()

  const trpc = useTRPC()

  const { data } = useSuspenseQuery(
    trpc.course.get
  )

  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ErrorBoundary fallback={<div>Une erreur est survenue</div>}>
        <LearningSectionSuspense courseId={courseId} lessonId={lessonId} />
      </ErrorBoundary>
    </Suspense>
  )
}

const LearningSectionSuspense = ({
  courseId,
  lessonId
}: LearningSectionProps) => {
  return (
    <div>
      Learn Section Suspense
    </div>
  )
}
