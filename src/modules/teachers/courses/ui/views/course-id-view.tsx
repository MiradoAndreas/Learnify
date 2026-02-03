import React from "react";
import { CourseIdSection } from "../sections/course-id-section";

interface CourseIdViewProps {
  courseId: string;
}

export const CourseIdView = ({ courseId }: CourseIdViewProps) => {
  return <CourseIdSection courseId={courseId} />;
};
