"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Play,
  CheckCircle,
  Lock,
  FileText,
  PlayCircle,
  Clock,
  Award,
  Circle,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCourseDuration } from "@/modules/teachers/courses/lessons/ui/utils/format-duration";
import { CourseProgress } from "@/modules/lesson-progress/types/progress.types";




interface LessonItemProps {
  lesson: Lesson;
  courseId: string;
  progress?: CourseProgress; // La progression pour CETTE leçon spécifique
  isActive?: boolean;
}

export const LessonItem = ({
  lesson,
  courseId,
  progress,
  isActive: forcedActive,
}: LessonItemProps) => {
  const searchParams = useSearchParams();
  const currentLesson = searchParams.get("lesson");

  // Déterminer si cette leçon est active
  const isActive = forcedActive !== undefined ? forcedActive : currentLesson === lesson.id;

  // Statuts dérivés
  const isCompleted = progress?.status === "completed";
  const isInProgress = progress?.status === "in_progress" && (progress?.progress || 0) > 0;
  const progressValue = progress?.progress || 0;
  const isLocked = lesson.visibility === "private"; // ou ta logique de verrouillage

  // Formater la date si disponible
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Déterminer l'icône selon le statut
  const getIcon = () => {
    if (isLocked) {
      return <Lock className="h-4 w-4 text-muted-foreground/50" />;
    }

    if (isCompleted) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }

    if (isInProgress) {
      return (
        <div className="relative">
          <PlayCircle className="h-5 w-5 text-primary" />
          <span className="absolute -top-2 -right-2 text-[10px] font-bold bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">
            {progressValue}%
          </span>
        </div>
      );
    }

    if (lesson.muxPlaybackId) {
      return <Play className="h-4 w-4 text-muted-foreground" />;
    }

    return <FileText className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <Link href={`/my-courses/${courseId}/learn?lesson=${lesson.id}`}>
      <Button
        variant="ghost"
        className={cn(
          "w-full h-auto py-3 px-4 justify-start gap-3 rounded-none hover:bg-accent/50 relative group transition-all",
          isActive && "bg-accent/80 hover:bg-accent",
          isCompleted && "hover:bg-green-50 dark:hover:bg-green-950/20",
          isLocked && "opacity-60 hover:opacity-80"
        )}
      >
        {/* Indicateur de progression vertical */}
        {isInProgress && (
          <div
            className="absolute left-0 top-0 bottom-0 w-1 bg-primary transition-all duration-500"
            style={{ height: `${progressValue}%` }}
          />
        )}

        {isCompleted && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500" />
        )}

        <div className="flex items-center gap-3 w-full">
          {/* Miniature */}
          {lesson.thumbnailUrl ? (
            <div className="relative w-10 h-10 rounded overflow-hidden shrink-0 border border-border">
              <Image
                src={lesson.thumbnailUrl}
                alt={lesson.title}
                fill
                sizes="40px"
                className="object-cover transition-transform group-hover:scale-105"
              />

              {/* Overlay de progression sur la miniature */}
              {isInProgress && (
                <div
                  className="absolute bottom-0 left-0 right-0 bg-primary/30 backdrop-blur-[1px]"
                  style={{ height: `${progressValue}%` }}
                />
              )}

              {isCompleted && (
                <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              )}
            </div>
          ) : (
            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0">
              {getIcon()}
            </div>
          )}

          {/* Contenu principal */}
          <div className="flex-1 text-left min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-sm line-clamp-1 font-medium",
                  isActive && "text-primary",
                  isCompleted && "text-green-600 dark:text-green-400"
                )}
              >
                {lesson.title}
              </span>

              {lesson.duration ? (
                <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />
                  {formatCourseDuration(lesson.duration)}
                </span>
              ) : null}
            </div>

            {/* Barre de progression pour les leçons en cours */}
            {isInProgress && (
              <div className="mt-1.5 space-y-0.5">
                <div className="flex items-center gap-2 text-xs">
                  <TrendingUp className="h-3 w-3 text-primary" />
                  <span className="text-primary font-medium">{progressValue}%</span>
                  <span className="text-muted-foreground">complété</span>
                </div>
                <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${progressValue}%` }}
                  />
                </div>
              </div>
            )}

            {/* Badge pour les leçons terminées */}
            {isCompleted && progress?.completedAt && (
              <div className="mt-1 flex items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                  <Award className="h-3 w-3" />
                  Terminé
                </span>
                <span className="text-muted-foreground">
                  {formatDate(progress.completedAt)}
                </span>
              </div>
            )}

            {/* Message pour les leçons non commencées */}
            {!progress && !isLocked && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Circle className="h-1 w-1 fill-current" />
                {lesson.muxPlaybackId ? "Prêt à commencer" : "Leçon à lire"}
              </p>
            )}

            {/* Message pour les leçons verrouillées */}
            {isLocked && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Débloquez cette leçon en progressant
              </p>
            )}
          </div>

          {/* Icône de statut à droite */}
          <div className={cn(
            "shrink-0",
            isCompleted && "text-green-500",
            isInProgress && "text-primary"
          )}>
            {getIcon()}
          </div>
        </div>
      </Button>
    </Link>
  );
};