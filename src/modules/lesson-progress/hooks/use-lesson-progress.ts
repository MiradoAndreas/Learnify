import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

interface UseLessonProgressProps {
  courseId: string;
  lessonId: string;
  duration: number; // Durée en millisecondes
}

export const useLessonProgress = ({
  courseId,
  lessonId,
  duration,
}: UseLessonProgressProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const lastSavedRef = useRef<number>(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Récupérer la progression existante
  const { data: progress } = useQuery(
    trpc.lessonProgress.getLessonProgress.queryOptions({
      courseId,
      lessonId,
    }),
  );

  // Mutation pour mettre à jour la progression
  const { mutate: trackProgress } = useMutation(
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

        // Afficher un toast si la leçon vient d'être terminée
        if (data.status === "completed" && progress?.status !== "completed") {
          toast.success("Bravo ! Leçon terminée ! 🎉");
        }
      },
      onError: (error) => {
        console.error("Erreur lors de la sauvegarde de la progression:", error);
      },
    }),
  );

  // Sauvegarder la progression (avec debounce)
  const saveProgress = useCallback(
    (currentTime: number, isEnded: boolean = false) => {
      if (!duration) return;

      const calculatedProgress = isEnded
        ? 100
        : Math.min(95, Math.round((currentTime / duration) * 100));

      const now = Date.now();

      // Sauvegarder toutes les 5 secondes ou si c'est la fin
      if (isEnded || now - lastSavedRef.current > 5000) {
        lastSavedRef.current = now;

        trackProgress({
          lessonId,
          progress: calculatedProgress,
          lastPosition: Math.round(currentTime),
        });
      }
    },
    [duration, lessonId, trackProgress],
  );

  // Fonction appelée quand la position de la vidéo change
  const handleTimeUpdate = useCallback(
    (currentTime: number) => {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout for debounced save
      saveTimeoutRef.current = setTimeout(() => {
        saveProgress(currentTime);
      }, 1000); // Debounce de 1 seconde
    },
    [saveProgress],
  );

  // Fonction appelée quand la vidéo est terminée
  const handleVideoEnded = useCallback(() => {
    saveProgress(duration / 1000, true); // Convertir ms en secondes
  }, [duration, saveProgress]);

  // Nettoyer le timeout
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    progress: progress?.progress || 0,
    isCompleted: progress?.status === "completed",
    lastPosition: progress?.lastPosition || 0,
    completedAt: progress?.completedAt,
    handleTimeUpdate,
    handleVideoEnded,
  };
};
