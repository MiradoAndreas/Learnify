"use client";

import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface CourseCompetencesSectionProps {
  courseId: string;
}

const CourseCompetencesSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Separator />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
};

const CourseCompetencesError = () => {
  return (
    <div className="text-muted-foreground">
      Les compétences ne sont pas disponibles
    </div>
  );
};

export const CourseCompetencesSection = ({
  courseId,
}: CourseCompetencesSectionProps) => {
  return (
    <Suspense fallback={<CourseCompetencesSkeleton />}>
      <ErrorBoundary fallback={<CourseCompetencesError />}>
        <CourseCompetencesSectionSuspense courseId={courseId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const CourseCompetencesSectionSuspense = ({
  courseId,
}: CourseCompetencesSectionProps) => {
  const trpc = useTRPC();

  const { data: competences } = useSuspenseQuery(
    trpc.course.getCourseCompetences.queryOptions({
      courseId,
    })
  );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h2 className="text-2xl font-bold">
          Quelles sont mes compétences apès ce cours ?
        </h2>
        <p className="text-muted-foreground mt-1">
          Ce cours vous permet d'acquérir des compétences directement applicables
        </p>
      </div>

     

      {/* Liste simple */}
      <div className="space-y-4">
        {competences.map((competence, index) => (
          <div key={competence.id} className="flex items-start">
            <div className="mr-3 text-primary font-medium">
              {String(index + 1).padStart(2, '0')}
            </div>
            <div>
              <div className="font-medium">
                {competence.text}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Appliquée à travers des exercices pratiques et des mises en situation
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};