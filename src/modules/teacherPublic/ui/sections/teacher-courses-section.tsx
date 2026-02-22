"use client"

import { InfiniteScroll } from "@/components/infinite-scroll"
import { DEFAULT_COURSE_LIMIT } from "@/constants"
import { CourseCard } from "@/modules/home/ui/components/course-card"
import { CoursesSkeleton } from "@/modules/home/ui/loading/course-card-skeleton"
import { useTRPC } from "@/trpc/client"
import { useSuspenseInfiniteQuery } from "@tanstack/react-query"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

interface TeacherBasicInfoSectionProps {
  id: string
}

export const TeacherCoursesSection = ({ id }: TeacherBasicInfoSectionProps) => {
  return (
    <Suspense fallback={<CoursesSkeleton />}>
      <ErrorBoundary fallback={<div>Error</div>}>

        <TeacherCoursesSectionSuspense id={id} />

      </ErrorBoundary>
    </Suspense>
  )
}

const TeacherCoursesSectionSuspense = ({ id }: TeacherBasicInfoSectionProps) => {
  const trpc = useTRPC()
  const { data: courses, hasNextPage,
    fetchNextPage,
    isFetchingNextPage } = useSuspenseInfiniteQuery(
      trpc.course.getPublishedCoursesByTeacher.infiniteQueryOptions({
        teacherId: id,
        limit: 4
      }, {
        getNextPageParam: lastPage => lastPage.nextCursor
      })
    )
  const allResults = courses?.pages.flatMap((page) => page.items) || []

  const total = courses?.pages[0]?.total || 0
  return (
    <>
      <div>
        {total > 0 ? (
          <p className="font-bold text-4xl text-center mt-10">Mes cours({total})</p>
        ) : (
          <p className="font-bold text-2xl md:text-3xl text-center mt-10">Aucun cours pour l'instant</p>
        )}

      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6 mt-7">
        {allResults.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      <InfiniteScroll
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        textInEnd={`Vous avez atteint la fin de mes cours, merci
          `}
      />
    </>
  )
}