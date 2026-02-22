import { DEFAULT_COURSE_LIMIT } from "@/constants"
import { TeacherPageView } from "@/modules/teacherPublic/ui/views/teacher-page-view"
import { HydrateClient, prefetch, trpc } from "@/trpc/server"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

const Page = async ({
  params
}: PageProps) => {
  const { id } = await params
  prefetch(
    trpc.teacher.getTeacherProfile.queryOptions({
      teacherId: id
    })
  )
  prefetch(
    trpc.course.getPublishedCoursesByTeacher.infiniteQueryOptions({
      teacherId: id,
      limit: DEFAULT_COURSE_LIMIT
    })
  )
  return (
    <HydrateClient>
      <TeacherPageView id={id} />
    </HydrateClient>
  )
}

export default Page