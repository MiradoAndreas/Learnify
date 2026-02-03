// modules/home/sections/course-section.tsx
"use client";

import { useInfiniteQuery, useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";

import { useTRPC } from "@/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseCard } from "../components/course-card";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_COURSE_LIMIT } from "@/constants";
import { CoursesSkeleton } from "../loading/course-card-skeleton";

interface CoursesSectionProps {
  categoryId?: string;
}

export const CoursesSection = ({ categoryId }: CoursesSectionProps) => {
  return (
    <Suspense key={categoryId} fallback={<CoursesSkeleton />}>
      <ErrorBoundary fallback={<CoursesError />}>
        <CoursesSectionSuspense categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  );
};



const CoursesError = () => {
  return (
    <div className="text-center py-12">
      <h3 className="text-lg font-semibold text-gray-900">
        Erreur de chargement
      </h3>
      <p className="text-gray-500 mt-2">
        Impossible de charger les cours. Veuillez réessayer.
      </p>
    </div>
  );
}

const CoursesSectionSuspense = ({ categoryId }: CoursesSectionProps) => {
  const trpc = useTRPC();

  const {
    data : courses,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useSuspenseInfiniteQuery(
    trpc.course.getAllPublishedCourses.infiniteQueryOptions(
      { categoryId, limit: DEFAULT_COURSE_LIMIT },
      { 
         getNextPageParam: lastPage => lastPage.nextCursor
         }
    ),
  );

  

  const allCourses = courses?.pages.flatMap((page) => page.items) || [];

  if (allCourses.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900">
          Aucun cours trouvé
        </h3>
        <p className="text-gray-500 mt-2">
          {categoryId
            ? "Aucun cours disponible dans cette catégorie."
            : "Aucun cours publié pour le moment."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Cours disponibles
          </h2>
          <p className="text-gray-500 mt-1">
            {allCourses.length} cours{" "}
            {categoryId ? "dans cette catégorie" : "disponibles"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {allCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      <InfiniteScroll
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        textInEnd="Vous atteind tous les cours disponible sur Learnify"
      />
    </div>
  );
};