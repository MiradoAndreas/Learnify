import { LessonView } from "@/modules/teachers/courses/lessons/ui/views/lesson-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

interface LessonPageProps {
  params: Promise<{ id: string }>;
}

const LessonPage = async ({ params }: LessonPageProps) => {
  const { id: courseId } = await params;
  prefetch(trpc.teacher.getAllLessonByCourseId.queryOptions({ courseId }));
  return (
    <HydrateClient>
      <LessonView courseId={courseId} />
    </HydrateClient>
  );
};

export default LessonPage;
