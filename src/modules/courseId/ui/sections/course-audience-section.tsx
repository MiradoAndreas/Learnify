"use client";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { motion } from "framer-motion"
interface CourseAudienceSectionProps {
  courseId: string;
}

const CourseAudienceSkeleton = () => {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-80" />
      <Separator />
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-5 w-5 rounded-full mt-1" />
            <Skeleton className="h-5 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
};

const CourseAudienceError = () => {
  return (
    <div className="rounded-lg border border-border p-6">
      <p className="text-muted-foreground text-center">
        Public cible non disponible
      </p>
    </div>
  );
};

export const CourseAudienceSection = ({
  courseId,
}: CourseAudienceSectionProps) => {
  return (
    <Suspense fallback={<CourseAudienceSkeleton />}>
      <ErrorBoundary fallback={<CourseAudienceError />}>
        <CourseAudienceSectionSuspense courseId={courseId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const CourseAudienceSectionSuspense = ({
  courseId,
}: CourseAudienceSectionProps) => {
  const trpc = useTRPC();

  const { data: audience } = useSuspenseQuery(
    trpc.course.getCourseAudience.queryOptions({
      courseId,
    })
  );

  return (
    <motion.div initial={{ opacity: 0, y: 100 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: .6 }} className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground dark:text-zinc-100">
          À quoi ce cours s'adresse-t-il ?
        </h2>
        <p className="text-muted-foreground dark:text-zinc-400 mt-1">
          Ce cours s'adresse aux personnes correspondant à ces profils
        </p>
      </div>

      <Separator className="bg-border dark:bg-zinc-800" />

      <div className="space-y-3">
        {audience.map((audienceItem) => (
          <div key={audienceItem.id} className="flex items-start gap-3">
            <Check className="h-5 w-5 text-primary dark:text-primary shrink-0 mt-1" />
            <span className="text-foreground dark:text-zinc-200 leading-relaxed">
              {audienceItem.text}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};