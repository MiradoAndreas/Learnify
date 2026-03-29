// components/ui/lesson-navigation.tsx
"use client"

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { formatDuration } from "@/modules/teachers/courses/lessons/ui/utils/format-duration";

interface LessonNavigationProps {
  courseId: string;
  currentLessonId: string;
  className?: string;
}

export const LessonNavigation = ({
  courseId,
  currentLessonId,
  className
}: LessonNavigationProps) => {
  const router = useRouter();
  const trpc = useTRPC();
  const [isNavigating, setIsNavigating] = useState(false);

  const { data: navigation } = useSuspenseQuery(
    trpc.course.getLessonNavigation.queryOptions({
      courseId,
      lessonId: currentLessonId
    })
  );

  const handleNavigation = async (lessonId: string | null) => {
    if (!lessonId || isNavigating) return;

    setIsNavigating(true);

    // Mise à jour de l'URL sans rechargement complet
    router.push(`/my-courses/${courseId}/learn?lesson=${lessonId}`, {
      scroll: false
    });

    // Focus sur le player pour l'accessibilité
    setTimeout(() => {
      const player = document.querySelector('[data-video-player]');
      if (player instanceof HTMLElement) {
        player.focus();
      }
      setIsNavigating(false);
    }, 100);
  };

  // Gestion des raccourcis clavier
  const handleKeyDown = (e: React.KeyboardEvent, direction: 'prev' | 'next') => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (direction === 'prev') {
        handleNavigation(navigation.previousLesson?.id || null);
      } else {
        handleNavigation(navigation.nextLesson?.id || null);
      }
    }
  };

  // Annoncer la navigation pour les lecteurs d'écran
  const getAriaLabel = () => {
    const current = navigation.previousLesson || navigation.nextLesson;
    if (!current) return "Navigation des leçons";

    const prevText = navigation.previousLesson
      ? `Leçon précédente : ${navigation.previousLesson.title}`
      : "Pas de leçon précédente";
    const nextText = navigation.nextLesson
      ? `Leçon suivante : ${navigation.nextLesson.title}`
      : "Pas de leçon suivante";

    return `Navigation des leçons. ${prevText}. ${nextText}.`;
  };

  return (
    <TooltipProvider>
      <nav
        className={`flex items-center gap-2 ${className}`}
        aria-label={getAriaLabel()}
        role="navigation"
      >

        {/* Bouton précédent */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleNavigation(navigation.previousLesson?.id || null)}
              onKeyDown={(e) => handleKeyDown(e, 'prev')}
              disabled={!navigation.previousLesson || isNavigating}
              aria-label={navigation.previousLesson
                ? `Aller à la leçon précédente : ${navigation.previousLesson.title}`
                : "Aucune leçon précédente disponible"
              }
              aria-disabled={!navigation.previousLesson}
              className="relative"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              {isNavigating && (
                <span className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-md">
                  <span className="sr-only">Chargement en cours</span>
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {navigation.previousLesson
              ? `${navigation.previousLesson.title} (${formatDuration(navigation.previousLesson.duration)})`
              : "Première leçon"}
          </TooltipContent>
        </Tooltip>

        {/* Bouton liste (à connecter avec votre sidebar) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label="Afficher la liste des leçons"
              onClick={() => {
                // Ici vous pouvez ouvrir votre sidebar
                const sidebar = document.querySelector('[data-sidebar-trigger]');
                if (sidebar instanceof HTMLElement) {
                  sidebar.click();
                }
              }}
            >
              <List className="h-4 w-4" aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Liste des leçons
          </TooltipContent>
        </Tooltip>

        {/* Bouton suivant */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleNavigation(navigation.nextLesson?.id || null)}
              onKeyDown={(e) => handleKeyDown(e, 'next')}
              disabled={!navigation.nextLesson || isNavigating}
              aria-label={navigation.nextLesson
                ? `Aller à la leçon suivante : ${navigation.nextLesson.title}`
                : "Aucune leçon suivante disponible"
              }
              aria-disabled={!navigation.nextLesson}
              className="relative"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              {isNavigating && (
                <span className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-md">
                  <span className="sr-only">Chargement en cours</span>
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {navigation.nextLesson
              ? `${navigation.nextLesson.title} (${Math.floor(navigation.nextLesson.duration / 60)}:${String(navigation.nextLesson.duration % 60).padStart(2, '0')})`
              : "Dernière leçon"}
          </TooltipContent>
        </Tooltip>

        {/* Indicateur de progression pour les lecteurs d'écran */}
        {/* <span className="sr-only" aria-live="polite" aria-atomic="true">
          {navigation.previousLesson ? `Leçon précédente : ${navigation.previousLesson.title}. ` : ''}
          {navigation.nextLesson ? `Leçon suivante : ${navigation.nextLesson.title}. ` : ''}
          {`Leçon ${navigation.previousLesson ? parseInt(navigation.previousLesson.position) + 1 : 1} sur ${navigation.totalLessons}`}
        </span> */}
      </nav>
    </TooltipProvider>
  );
};