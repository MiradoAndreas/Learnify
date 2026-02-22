"use client";

import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { motion } from "framer-motion"
interface CourseResourcesSectionProps {
  courseId: string;
}

const CourseResourcesSkeleton = () => {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-48" />
      <Separator />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-28" />
      </div>
    </div>
  );
};

const CourseResourcesError = () => {
  return null;
};

export const CourseResourcesSection = ({
  courseId,
}: CourseResourcesSectionProps) => {
  return (
    <Suspense fallback={<CourseResourcesSkeleton />}>
      <ErrorBoundary fallback={<CourseResourcesError />}>
        <CourseResourcesSectionSuspense courseId={courseId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const CourseResourcesSectionSuspense = ({
  courseId,
}: CourseResourcesSectionProps) => {
  const trpc = useTRPC();

  const { data: resources } = useSuspenseQuery(
    trpc.course.getCourseResources.queryOptions({
      courseId,
    })
  );

  const courseResourcesCount = resources.courseAttachments.length;
  const lessonResourcesCount = resources.lessonAttachments.length;
  const totalResources = courseResourcesCount + lessonResourcesCount;

  if (totalResources === 0) {
    return null;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 100 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: .6 }} className="space-y-4">
      <h3 className="font-bold text-2xl text-foreground dark:text-zinc-100">
        Ressources disponibles
      </h3>

      <Separator className="bg-border dark:bg-zinc-800" />

      <div className="space-y-2 text-sm">
        {courseResourcesCount > 0 && (
          <div className="text-foreground dark:text-zinc-200 text-xl">
            • {courseResourcesCount} ressource{courseResourcesCount > 1 ? 's' : ''} principales du cours
          </div>
        )}

        {lessonResourcesCount > 0 && (
          <div className="text-foreground dark:text-zinc-200 text-xl">
            • {lessonResourcesCount} ressource{lessonResourcesCount > 1 ? 's' : ''} complémentaires sur les leçons
          </div>
        )}

        <div className="text-muted-foreground dark:text-zinc-400 pt-1">
          Tous les supports sont inclus dans votre inscription.
        </div>
      </div>
    </motion.div>
  );
};