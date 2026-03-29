// types/progress.types.ts
export interface LessonProgress {
  lessonId: string;
  progress: number;
  status: "in_progress" | "completed";
  completedAt: string | null;
}

export interface CourseProgress {
  totalLessons: number;
  completedLessons: number;
  overallProgress: number;
  lessons: LessonProgress[];
}
