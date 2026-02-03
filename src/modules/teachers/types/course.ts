import { Course } from "../ui/sections/teacher-dashboard-section";

// types/course.ts
export interface CourseAttachment {
  id: string;
  courseId: string;
  name: string;
  url: string;
  key: string;
  type: "pdf" | "ppt" | "doc" | "image" | "zip" | "txt" | "other";
  size: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseWithAttachments extends Course {
  attachments: CourseAttachment[];
}
