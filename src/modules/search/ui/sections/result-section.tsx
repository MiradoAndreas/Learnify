"use client"
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_COURSE_LIMIT } from "@/constants";
import { CourseCard } from "@/modules/home/ui/components/course-card";
import {  CoursesSkeleton } from "@/modules/home/ui/loading/course-card-skeleton";
import { useTRPC } from "@/trpc/client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface ResultSectionProps {
  query: string | undefined;
  categoryId: string | undefined;
}



const ResultSectionError = () => {
  return <div>Error</div>;
}

export const ResultSection = ({ query, categoryId }: ResultSectionProps) => {
  return (
    <Suspense
      key={`${query}-${categoryId}`}
      fallback={<CoursesSkeleton />}
    >
      <ErrorBoundary fallback={<ResultSectionError />}>
        <ResultsSectionSuspense query={query} categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const ResultsSectionSuspense = ({ query, categoryId }: ResultSectionProps) => {
  const trpc = useTRPC();
  

  const {
    data : results,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useSuspenseInfiniteQuery(
    trpc.search.searchCourses.infiniteQueryOptions(
      {
        query,
        categoryId,
        limit: DEFAULT_COURSE_LIMIT,
      }, {
        getNextPageParam: lastPage => lastPage.nextCursor
      }
    ),
  );

  const allResults = results?.pages.flatMap((page) => page.items) || [];

  return (
    <>
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {allResults.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      <InfiniteScroll
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        textInEnd={`Vous avez atteint la fin de votre recherche}`}
      />
    </>
  )
}