"use client";

import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense, useEffect, useState } from "react";

import { useTRPC } from "@/trpc/client";

import { CourseCard } from "../components/course-card";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_COURSE_LIMIT } from "@/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface CoursesSectionProps {
  categoryId?: string;
}

export const CoursesSection = ({ categoryId }: CoursesSectionProps) => {
  // Solution 1: Utiliser un état pour le rendu côté client uniquement
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Retourner un skeleton pendant le SSR et l'hydratation initiale
  if (!isMounted) {
    return <CoursesSkeleton />;
  }

  return (
    <Suspense key={categoryId} fallback={<CoursesSkeleton />}>
      <ErrorBoundary fallback={<CoursesError />}>
        <CoursesSectionSuspense categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  );
};

// Skeleton principal avec shadcn/ui
const CoursesSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-32 rounded-md" />
        </div>
      </div>

      {/* Grid de cartes skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={`skeleton-${index}`} className="overflow-hidden border-border/50 shadow-sm">
            {/* Image/Thumbnail */}
            <Skeleton className="aspect-video w-full rounded-none" />

            <div className="p-4 space-y-4">
              {/* Titre et description */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>

              {/* Séparateur */}
              <div className="h-px bg-border/50" />

              {/* Informations du formateur */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>

              {/* Métriques du cours */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>

              {/* Prix et bouton */}
              <div className="flex items-center justify-between pt-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-9 w-24 rounded-lg" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Infinite scroll skeleton */}
      <div className="flex justify-center py-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full animate-spin" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
  );
};

const CoursesError = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-destructive"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Erreur de chargement
      </h3>
      <p className="text-muted-foreground text-center max-w-sm">
        Impossible de charger les cours. Veuillez vérifier votre connexion et réessayer.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Réessayer
      </button>
    </div>
  );
};

const CoursesSectionSuspense = ({ categoryId }: CoursesSectionProps) => {
  const trpc = useTRPC();

  const {
    data: courses,
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
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Aucun cours trouvé
        </h3>
        <p className="text-muted-foreground text-center max-w-sm">
          {categoryId
            ? "Aucun cours disponible dans cette catégorie pour le moment."
            : "Aucun cours publié pour le moment. Revenez plus tard !"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Cours disponibles
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
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
        textInEnd="Vous avez atteint tous les cours disponibles sur Learnify"
      />
    </div>
  );
};