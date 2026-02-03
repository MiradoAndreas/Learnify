import { CourseIdView } from "@/modules/courseId/ui/views/course-id-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    courseId: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  const { courseId } = await params;
  prefetch(
    trpc.course.getCourseBasicInfo.queryOptions({
      courseId,
    })
  );
  prefetch(
    trpc.course.getCourseInstructor.queryOptions({
      courseId,
    })
  );
  prefetch(
    trpc.course.getCourseObjectives.queryOptions({
      courseId,
    })
  );

  prefetch(
    trpc.course.getCourseCompetences.queryOptions({
      courseId,
    })
  );
  prefetch(
    trpc.course.getCourseAudience.queryOptions({
      courseId,
    })
  );

  prefetch(
    trpc.course.getCourseCurriculum.queryOptions({
      courseId,
    })
  );

  prefetch(
    trpc.course.getCourseResources.queryOptions({
      courseId,
    })
  );


  return (
    <HydrateClient>
      <CourseIdView courseId={courseId} />
    </HydrateClient>
  );
};

export default Page;
