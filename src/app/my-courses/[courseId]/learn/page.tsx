
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { LearningView } from "@/modules/learn/ui/views/learning-view";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DEFAULT_COURSE_LIMIT } from "@/constants";
import { PanelLeft } from "lucide-react";

interface PageProps {
  params: Promise<{
    courseId: string;
  }>;
  searchParams: Promise<{
    lesson?: string;
  }>;
}

const Page = async ({ params, searchParams }: PageProps) => {
  const { courseId } = await params;
  const { lesson: lessonId } = await searchParams;

  if (!lessonId) {
    return (
      <div>
        <div className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 my-5 md:my-6">

        </div>
        <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center p-4">
          <div className="max-w-sm w-full text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto bg-linear-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
            </div>

            <h2 className="text-xl font-medium mb-2">
              Bienvenue dans le cours
            </h2>

            <p className="text-sm text-muted-foreground mb-6">
              Choisissez une leçon dans le menu pour commencer votre apprentissage
            </p>

            <div className="text-xs text-muted-foreground/50 flex items-center justify-center gap-2">
              <kbd className="px-2 py-1 bg-muted rounded-md text-xs">⌘</kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-muted rounded-md text-xs">B</kbd>
              <span className="ml-2">pour ouvrir le menu</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  prefetch(
    trpc.course.getLessonVideo.queryOptions({ courseId, lessonId })
  )
  prefetch(
    trpc.course.getLessonDetails.queryOptions({ courseId, lessonId })
  )
  prefetch(
    trpc.course.getLessonNavigation.queryOptions({ courseId, lessonId })
  )

  prefetch(
    trpc.comments.getMany.infiniteQueryOptions({ courseId, lessonId, limit: DEFAULT_COURSE_LIMIT })
  )



  return (
    <HydrateClient>
      <div className="px-4 md:px-6">
        <div className="focus:p-4 my-5 md:my-6">
          <SidebarTrigger size="lg" aria-label="Ouvrir le menu des leçons" icon={<PanelLeft className="size-8" />} />

        </div>


        <LearningView courseId={courseId} lessonId={lessonId} />
      </div>

    </HydrateClient>
  );
};

export default Page;
