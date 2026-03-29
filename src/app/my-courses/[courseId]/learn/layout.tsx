
import { CourseSection } from "@/modules/courses/types/course.type";
import { MyCourseLayout } from "@/modules/my-courses/ui/layout";
import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";
// import { useSearchParams } from "next/navigation";


interface LayoutProps {
  params: Promise<{
    courseId: string
  }>;
  children: React.ReactNode;
}

const Layout = async ({
  params,
  children,
}: LayoutProps) => {
  const { courseId } = await params

  // Récuperer le lessonId avec searchParams
  // const searchParams = useSearchParams();
  // const currentlessonId = searchParams.get("lesson");



  const queryClient = getQueryClient()

  const myCourse = await queryClient.fetchQuery(
    trpc.course.getCourseCurriculum.queryOptions({
      courseId
    })
  )

  const myCourseTitle = await queryClient.fetchQuery(
    trpc.course.getCourseTitlByCourseId.queryOptions({
      courseId
    })
  )

  // const progress = await queryClient.fetchQuery(
  //   trpc.lessonProgress.getLessonProgress.queryOptions({

  //     courseId,
  //     lessonId: currentlessonId as string
  //   })
  // )



  return (
    <HydrateClient>
      <MyCourseLayout
        myCourse={myCourse as CourseSection[]}
        courseId={courseId}
        myCourseTitle={myCourseTitle.title}
      // progress={progress}
      >
        {children}
      </MyCourseLayout>
    </HydrateClient>
  )
}

export default Layout