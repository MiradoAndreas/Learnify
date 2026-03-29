// modules/my-courses/ui/layout.tsx
"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";
import { MyCourseNavbar } from "../components/my-course-navbar";
import { MyCourseSidebar } from "../components/my-course-sidebar";
import { CourseSection } from "@/modules/courses/types/course.type";


interface MyCourseLayoutProps {
  children: React.ReactNode;
  myCourse: CourseSection[];
  courseId: string;
  myCourseTitle: string;
  progress?: {
    progress: number;
    status: "in_progress" | "completed";
  } | null;
}

export const MyCourseLayout = ({ children, myCourse, courseId, myCourseTitle, progress }: MyCourseLayoutProps) => {
  return (
    <SidebarProvider style={
      {
        "--sidebar-width": "30rem",
        "--sidebar-width-mobile": "26rem",
      } as React.CSSProperties
    }>
      <div className="w-full">
        {/* <MyCourseNavbar /> */}
        <div className="flex flex-1 min-h-screen">
          <MyCourseSidebar sections={myCourse} courseId={courseId} myCourseTitle={myCourseTitle} progress={progress} />
          <main className="flex-1 overflow-y-auto bg-background pt-5 lg:pt-10">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};