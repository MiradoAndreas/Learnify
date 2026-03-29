
"use client"

import { VideoPlayer } from "@/components/video-player";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LessonNavigation } from "../../components/lesson-navigation";
import { formatDuration } from "@/modules/teachers/courses/lessons/ui/utils/format-duration";
import { toast } from "sonner";


interface PlayerSectionProps {
  courseId: string;
  lessonId: string
}

const PlayerSectionSkeleton = () => {
  return (
    <Card className="w-full">
      <div className="aspect-video bg-muted">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="p-4 flex items-center justify-between">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </Card>
  )
}

const PlayerSectionError = () => {
  return (
    <Card className="w-full p-8 text-center">
      <p className="text-destructive" role="alert">
        Une erreur est survenue lors du chargement de la vidéo
      </p>
    </Card>
  )
}

export const PlayerSection = ({
  courseId,
  lessonId
}: PlayerSectionProps) => {
  return (
    <Suspense fallback={<PlayerSectionSkeleton />}>
      <ErrorBoundary fallback={<PlayerSectionError />}>
        <PlayerSectionSuspense courseId={courseId} lessonId={lessonId} />
      </ErrorBoundary>
    </Suspense>
  )
}

const PlayerSectionSuspense = ({
  courseId,
  lessonId
}: PlayerSectionProps) => {
  const trpc = useTRPC();

  const { data: video } = useSuspenseQuery(
    trpc.course.getLessonVideo.queryOptions({ courseId, lessonId })
  );

  const queryClient = useQueryClient()

  const progress = useQuery(
    trpc.lessonProgress.getLessonProgress.queryOptions({
      courseId,
      lessonId,
    }),
  )

  console.log(progress)

  const trackProgressMutation = useMutation(
    trpc.lessonProgress.trackLessonProgress.mutationOptions({
      onSuccess: (data) => {
        // Invalider les queries pour rafraîchir les données
        queryClient.invalidateQueries(
          trpc.lessonProgress.getLessonProgress.queryOptions({
            lessonId,
            courseId,
          }),
        );
        queryClient.invalidateQueries(
          trpc.lessonProgress.getCourseProgress.queryOptions({
            courseId,
          }),
        );
      },
      onError: (error) => {
        console.error("Erreur lors de la sauvegarde de la progression:", error);
      },
    }),
  )

  const handleVideoEnded = () => {

    toast.success("La vidéo est terminée ! 🎉");

    if (!video?.duration) return
    trackProgressMutation.mutate({
      courseId,
      lessonId,
      lastPosition: video.duration,
      duration: video.duration,
    })

    console.log(progress)
  };

  return (
    <Card className="w-full overflow-hidden">

      <div className="p-4 border-b flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold" id="video-title">
            {video.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            Durée: {formatDuration(video.duration)}
          </p>
        </div>

        <LessonNavigation
          courseId={courseId}
          currentLessonId={lessonId}
        />
      </div>

      {/* Lecteur vidéo */}
      <div aria-labelledby="video-title">
        <VideoPlayer
          playbackId={video.muxPlaybackId}
          thumbnailUrl={video.thumbnailUrl}
          onEnded={handleVideoEnded}
          autoPlay={false}
        />
      </div>
    </Card>
  );
};