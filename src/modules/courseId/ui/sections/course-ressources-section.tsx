"use client";

import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

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
    <div className="space-y-4">
      <h3 className="font-bold text-2xl">Ressources disponibles</h3>
      
      <Separator />
      
      <div className="space-y-2 text-sm">
        {courseResourcesCount > 0 && (
          <div className="text-foreground text-xl">
            • {courseResourcesCount} ressource{courseResourcesCount > 1 ? 's' : ''} principales du cours
          </div>
        )}
        
        {lessonResourcesCount > 0 && (
          <div className="text-foreground text-xl">
            • {lessonResourcesCount} ressource{lessonResourcesCount > 1 ? 's' : ''} complémentaires sur les leçons
          </div>
        )}
        
        <div className="text-muted-foreground pt-1">
          Tous les supports sont inclus dans votre inscription.
        </div>
      </div>
    </div>
  );
};