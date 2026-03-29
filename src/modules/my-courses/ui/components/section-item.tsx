// modules/my-courses/components/section-item.tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Clock, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CourseSection } from "@/modules/courses/types/course.type";
import { LessonItem } from "./lesson-item";
import { formatCourseDuration } from "@/modules/teachers/courses/lessons/ui/utils/format-duration";
import { CourseProgress } from "@/modules/lesson-progress/types/progress.types";

interface SectionItemProps {
  section: CourseSection;
  courseId: string;
  isExpanded: boolean;
  onToggle: () => void;
  sectionNumber: number;
  progress?: CourseProgress
}

export const SectionItem = ({
  section,
  courseId,
  isExpanded,
  onToggle,
  sectionNumber,
  progress
}: SectionItemProps) => {
  const totalDuration = section.lessons.reduce(
    (acc, lesson) => acc + (lesson.duration || 0),
    0
  );



  return (
    <div className="bg-card">
      <Button
        variant="ghost"
        onClick={onToggle}
        className="w-full h-auto py-4 px-4 justify-between hover:bg-accent/50 rounded-none"
      >

        <div className="flex items-start gap-3">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 mt-1 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 mt-1 shrink-0 text-muted-foreground" />
          )}

          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                Section {sectionNumber}: {section.title}
              </span>
              <Badge variant="outline" className="text-xs">
                {section.lessons.length} leçons
              </Badge>
            </div>

            {totalDuration > 0 && (
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatCourseDuration(totalDuration)}</span>
              </div>
            )}
          </div>
        </div>
      </Button>

      <div className={cn(
        "overflow-hidden transition-all duration-300",
        isExpanded ? "max-h-[2000px]" : "max-h-0"
      )}>
        <div className="pb-2">
          {section.lessons.map((lesson, index) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}

              progress={progress}
              courseId={courseId}
              lessonNumber={index + 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};