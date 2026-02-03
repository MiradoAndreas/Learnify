import { CourseIdView } from "@/modules/teachers/courses/ui/views/course-id-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}
const Page = async ({ params }: PageProps) => {
  const { id } = await params;
  prefetch(trpc.teacher.getCourseDetails.queryOptions({ id }));
  prefetch(trpc.teacher.getAllCategories.queryOptions());
  prefetch(trpc.teacher.getCourseAttachments.queryOptions({ courseId: id }));

  return (
    <HydrateClient>
      <CourseIdView courseId={id} />
    </HydrateClient>
  );
};

export default Page;
