import { LessonIdView } from "@/modules/teachers/courses/lessons/ui/views/lesson-id-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
export const dynamic = "force-dynamic";
interface PageProps {
  params: Promise<{ id: string; lessonId: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { lessonId, id: courseId } = await params;
  prefetch(trpc.teacher.getLesson.queryOptions({ lessonId }));
  prefetch(trpc.teacher.getLessonAttachments.queryOptions({ lessonId }));
  return (
    <HydrateClient>
      <LessonIdView lessonId={lessonId} courseId={courseId} />
    </HydrateClient>
  );
};

export default Page;
