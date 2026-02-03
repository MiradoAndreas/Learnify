"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration } from "@/modules/teachers/courses/lessons/ui/utils/format-duration";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CheckCircle, Clock, Eye, Lock, PlayCircle, ChevronDown, ChevronUp, ArrowLeftIcon } from "lucide-react"; // Ajoutez ChevronDown et ChevronUp
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface CourseCurriculumSectionProps {
  courseId: string;
  onFreeLessonsReady: (lessons: any[]) => void;
  onPlayFreeLesson: (index: number) => void;
}

const CourseCurriculumSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-8 w-40" />
      </div>
      <Separator />
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

const CourseCurriculumError = () => {
  return (
    <div className="rounded-lg border border-border p-6">
      <p className="text-muted-foreground text-center">
        Programme non disponible
      </p>
    </div>
  );
};

export const CourseCurriculumSection = ({
  onFreeLessonsReady,
  onPlayFreeLesson,
  courseId
}: CourseCurriculumSectionProps) => {
  return (
    <Suspense fallback={<CourseCurriculumSkeleton />}>
      <ErrorBoundary fallback={<CourseCurriculumError />}>
        <CourseCurriculumSectionSupsense 
          onFreeLessonsReady={onFreeLessonsReady} 
          onPlayFreeLesson={onPlayFreeLesson} 
          courseId={courseId} 
        />
      </ErrorBoundary>
    </Suspense>
  );
};

const CourseCurriculumSectionSupsense = ({
  onFreeLessonsReady,
  onPlayFreeLesson,
  courseId
}: CourseCurriculumSectionProps) => {
  const trpc = useTRPC();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const { data: curriculum } = useSuspenseQuery(
    trpc.course.getCourseCurriculum.queryOptions({
      courseId,
    })
  );

  useEffect(() => {
    if (!curriculum) return;
  
    const freeLessons = curriculum.flatMap((section) =>
      section.lessons
        .filter((l) => l.visibility === "free")
        .map((l) => ({
          id: l.id,
          title: l.title,
          muxPlaybackId: l.muxPlaybackId,
          thumbnailUrl: l.thumbnailUrl,
          sectionTitle: section.title,
        }))
    );
  
    onFreeLessonsReady(freeLessons);
  }, [curriculum]);

  // Fonction pour développer toutes les sections
  const expandAll = () => {
    if (curriculum) {
      setExpandedSections(curriculum.map(section => section.id));
    }
  };

  // Fonction pour réduire toutes les sections
  const collapseAll = () => {
    setExpandedSections([]);
  };

  // Vérifie si toutes les sections sont développées
  const allExpanded = curriculum && expandedSections.length === curriculum.length;
  // Vérifie si au moins une section est développée
  const anyExpanded = expandedSections.length > 0;

  const totalLessons = curriculum?.reduce(
    (total, section) => total + (section.lessons?.length || 0),
    0
  );

  const totalDuration = curriculum?.reduce((total, section) => {
    return (
      total +
      (section.lessons?.reduce(
        (sum, lesson) => sum + (lesson.duration || 0),
        0
      ) || 0)
    );
  }, 0);

  const freeLessonsCount = curriculum?.reduce(
    (total, section) => 
      total + (section.lessons?.filter(l => l.visibility === "free").length || 0),
    0
  );

  return (
    <div>
      <div className="mb-5">
    <Link
      prefetch
      href="/home"
      className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors"
    >
      <ArrowLeftIcon /> Back to all courses
    </Link>
  </div>
    <div className="space-y-6">
     
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Module du cours</h2>
          <p className="text-muted-foreground mt-1">
            {curriculum?.length} sections • {totalLessons} leçons
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Boutons pour développer/réduire toutes les sections */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={expandAll}
              disabled={allExpanded}
              className="h-8"
            >
              <ChevronDown className="h-4 w-4 mr-2" />
              Tout développer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={collapseAll}
              disabled={!anyExpanded}
              className="h-8"
            >
              <ChevronUp className="h-4 w-4 mr-2" />
              Tout réduire
            </Button>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <div className="font-medium">{totalLessons}</div>
              <div className="text-muted-foreground">Leçons</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{formatDuration(totalDuration || 0)}</div>
              <div className="text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{freeLessonsCount}</div>
              <div className="text-muted-foreground">Gratuites</div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <Accordion 
        type="multiple" // Changez de "single" à "multiple" pour permettre plusieurs sections ouvertes
        value={expandedSections}
        onValueChange={setExpandedSections}
        className="space-y-2"
      >
        {curriculum?.map((section, sectionIndex) => {
          const sectionDuration = section.lessons?.reduce((sum, lesson) => 
            sum + (lesson.duration || 0), 0) || 0;
          
          const totalSectionLessons = section.lessons?.length || 0;

          return (
            <AccordionItem 
              key={section.id} 
              value={section.id}
              className="border rounded-lg px-4"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-medium text-muted-foreground">
                      {String(sectionIndex + 1).padStart(2, '0')}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-foreground">
                        {section.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center">
                          <PlayCircle className="h-4 w-4 mr-1" />
                          {totalSectionLessons} leçons
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDuration(sectionDuration)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="pb-4">
                <div className="ml-12 space-y-3">
                  {section.lessons?.map((lesson, lessonIndex) => (
                    <div 
                      key={lesson.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="shrink-0">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <PlayCircle className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground">
                            {lessonIndex + 1}. {lesson.title}
                          </h4>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {lesson.visibility === "free" ? (
                          <Badge variant="outline" className="text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            Gratuit
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                        
                        <span className="text-sm text-muted-foreground">
                          {lesson.duration ? formatDuration(lesson.duration) : '--:--'}
                        </span>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            if (lesson.visibility === "free") {
                              const freeLessons = section.lessons
                                ?.filter((l) => l.visibility === "free")
                                .map((l, idx) => ({
                                  id: l.id,
                                  title: l.title,
                                  muxPlaybackId: l.muxPlaybackId,
                                  thumbnailUrl: l.thumbnailUrl,
                                  sectionTitle: section.title,
                                })) || [];
                              
                              const lessonIndexInFree = freeLessons.findIndex(l => l.id === lesson.id);
                              if (lessonIndexInFree !== -1) {
                                onPlayFreeLesson(lessonIndexInFree);
                              }
                            }
                          }}
                        >
                          <PlayCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <div className="rounded-lg border p-6 space-y-4">
        <h3 className="font-semibold">Ce cours comprend</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            <span className="text-sm">Accès permanent</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            <span className="text-sm">Support inclus</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            <span className="text-sm">Certificat de fin</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            <span className="text-sm">Ressources téléchargeables</span>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};