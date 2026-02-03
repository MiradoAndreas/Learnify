"use client"

import { useState } from "react";
import { CourseCurriculumSection } from "./course-curriculum-section";
import { CourseSidebarSection } from "./course-sidebar-section";
import { LessonVideoModal } from "../components/lesson-video-modal";

interface CoursePreviewControllerProps {
  courseId: string;
}

export const CoursePreviewController = ({
  courseId
}: CoursePreviewControllerProps) => {
  const [freeLessons, setFreeLessons] = useState<any[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <>
      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2">
          <CourseCurriculumSection
            courseId={courseId}
            onFreeLessonsReady={setFreeLessons}
            onPlayFreeLesson={(index) => {
              setCurrentLessonIndex(index);
              setIsVideoOpen(true);
            }}
          />
        </div>

        <div className="lg:col-span-1">
          <CourseSidebarSection
            courseId={courseId}
            freeLessons={freeLessons}
            onPlayPreview={() => {
              setCurrentLessonIndex(0);
              setIsVideoOpen(true);
            }}
          />
        </div>
      </div>

      <LessonVideoModal
        open={isVideoOpen}
        onOpenChange={setIsVideoOpen}
        lessons={freeLessons}
        currentIndex={currentLessonIndex}
        onChangeIndex={setCurrentLessonIndex}
      />
    </>
  );
}
