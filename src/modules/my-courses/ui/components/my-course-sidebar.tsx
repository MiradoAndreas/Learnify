
"use client";

import { Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import { CourseSection } from "@/modules/courses/types/course.type";
import { CourseSidebarHeader } from "./course-sidebar-header";
import { SectionsList } from "./list-section";
import { CourseProgress } from "@/modules/lesson-progress/types/progress.types";

interface MyCourseSidebarProps {
  sections: CourseSection[];
  courseId: string;
  myCourseTitle: string;
  progress?: CourseProgress;
}

export const MyCourseSidebar = ({ sections, courseId, myCourseTitle, progress }: MyCourseSidebarProps) => {
  return (
    <Sidebar
      side="left"
      className=" z-40 border-r bg-background"
      aria-label="Menu des cours"
    >
      <SidebarHeader className="border-b px-4 py-8">
        <CourseSidebarHeader title={myCourseTitle} />
      </SidebarHeader>
      <SidebarContent className="bg-background">
        <SectionsList sections={sections} courseId={courseId} progress={progress} />
      </SidebarContent>
    </Sidebar>
  );
};
