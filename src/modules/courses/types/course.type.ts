// types/course.types.ts
export interface Lesson {
  id: string;
  title: string;
  description: string | null;
  position: number;
  duration: number | null;
  visibility: "public" | "private";
  isPublished: boolean;
  muxPlaybackId: string | null;
  thumbnailUrl: string | null;
  createdAt: Date;
}

export interface CourseSection {
  id: string;
  title: string;
  position: number;
  lessons: Lesson[];
}

export interface CourseProgress {
  totalLessons: number;
  completedLessons: number;
  percentage: number;
  lastAccessedAt: Date | null;
}

export interface CourseAttachment {
  id: string;
  name: string;
  attachmentUrl: string;
  type: string;
  size: number;
  createdAt: Date;
}

export interface LessonAttachment {
  lessonId: string;
  lessonTitle: string;
  attachmentId: string;
  attachmentName: string;
  attachmentUrl: string;
  type: string;
  size: number;
  createdAt: Date;
}

export interface CourseResources {
  courseAttachments: CourseAttachment[];
  lessonAttachments: LessonAttachment[];
}

// types/course.types.ts
export interface LessonVideo {
  id: string;
  title: string;
  muxPlaybackId: string | null;
  muxAssetId: string | null;
  muxStatus: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  position: number;
  sectionId: string;
  courseId: string;
}

export interface LessonDetails {
  id: string;
  title: string;
  description: string | null;
  position: number;
  duration: number | null;
  visibility: "public" | "private";
  createdAt: Date;
  updatedAt: Date;
  section: {
    id: string;
    title: string;
    position: number;
  };
  course: {
    id: string;
    title: string;
    level: string;
    language: string;
  };
 
  resources: LessonResource[];
  totalLessonsInCourse: number;
}

export interface LessonResource {
  id: string;
  name: string;
  attachmentUrl: string;
  type: string;
  size: number;
  createdAt: Date;
}

export interface LessonNavigation {
  previousLesson: {
    id: string;
    title: string;
    position: number;
  } | null;
  nextLesson: {
    id: string;
    title: string;
    position: number;
  } | null;
  sectionLessons: {
    id: string;
    title: string;
    position: number;
    duration: number | null;
  }[];
  currentSection: {
    id: string;
    title: string;
    position: number;
    totalLessons: number;
  };
}