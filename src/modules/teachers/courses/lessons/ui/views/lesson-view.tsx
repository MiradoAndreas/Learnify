import { LessonSection } from "../sections/lesson-section";

interface LessonViewProps {
  courseId: string;
}
export const LessonView = ({ courseId }: LessonViewProps) => {
  return <LessonSection courseId={courseId} />;
};
