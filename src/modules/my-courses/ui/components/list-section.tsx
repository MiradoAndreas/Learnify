// modules/my-courses/components/sections-list.tsx
"use client";

import { useState } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { CourseSection } from "@/modules/courses/types/course.type";
import { SectionItem } from "./section-item";
import { CourseProgress } from "@/modules/lesson-progress/types/progress.types";

interface SectionsListProps {
  sections: CourseSection[];
  courseId: string;
  progress?: CourseProgress
}

export const SectionsList = ({ sections, courseId, progress }: SectionsListProps) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(
    sections.length > 0 ? [sections[0].id] : []
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="divide-y">
        {sections.map((section, index) => (
          <SectionItem
            key={section.id}
            section={section}
            progress={progress}
            courseId={courseId}
            isExpanded={expandedSections.includes(section.id)}
            onToggle={() => toggleSection(section.id)}
            sectionNumber={index + 1}
          />
        ))}
      </div>
    </ScrollArea>
  );
};