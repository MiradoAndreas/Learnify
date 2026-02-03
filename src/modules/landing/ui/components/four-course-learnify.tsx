"use client"

import { CourseCard } from "@/modules/home/ui/components/course-card";
import { CoursesSkeleton } from "@/modules/home/ui/loading/course-card-skeleton";
import { useTRPC } from "@/trpc/client"
import { useQuery } from "@tanstack/react-query";

export const FourCourseLearnify = () => {

  const trpc = useTRPC();

  const { data: courses, isLoading } = useQuery(trpc.course.getPublishedCourses.queryOptions({
    categoryId: undefined
  }))

  if (!isLoading) {
    <CoursesSkeleton />
  }



  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

        {courses?.items.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  )
}
