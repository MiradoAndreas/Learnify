import { LessonIdSection } from "../sections/lesson-id-section";

interface LessonIdViewProps {
  lessonId: string;
  courseId: string;
}

export const LessonIdView = ({ lessonId, courseId }: LessonIdViewProps) => {
  return <LessonIdSection lessonId={lessonId} courseId={courseId} />;
};
