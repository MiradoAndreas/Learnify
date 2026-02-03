"use client";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface CourseObjectivesSectionProps {
  courseId: string;
}

const CourseObjectivesSkeleton = () => {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Separator />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-5 w-5 rounded-full mt-1" />
            <Skeleton className="h-5 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
};

const CourseObjectivesError = () => {
  return (
    <div className="rounded-lg border border-border p-6">
      <p className="text-muted-foreground text-center">
        Objectifs d'apprentissage non disponibles
      </p>
    </div>
  );
};

export const CourseObjectivesSection = ({
  courseId,
}: CourseObjectivesSectionProps) => {
  return (
    <Suspense fallback={<CourseObjectivesSkeleton />}>
      <ErrorBoundary fallback={<CourseObjectivesError />}>
        <CourseObjectivesSectionSuspense courseId={courseId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const CourseObjectivesSectionSuspense = ({
  courseId,
}: CourseObjectivesSectionProps) => {
  const trpc = useTRPC();
  const { data: objectives } = useSuspenseQuery(
    trpc.course.getCourseObjectives.queryOptions({
      courseId,
    })
  );
  
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Qu'est ce que je peux gagner après ce cours ?</h2>
        <p className="text-muted-foreground mt-1">
          Après ce cours vous avez le niveau à :
        </p>
      </div>

     

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {objectives.map((objective) => (
          <div key={objective.id} className="flex items-start gap-3">
            <div className="shrink-0 mt-1">
              <Check className="h-5 w-5 text-primary" />
            </div>
            <span className="text-foreground leading-relaxed">
              {objective.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};