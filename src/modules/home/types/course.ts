// types/course.ts
export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl: string | null;
  level: "beginner" | "intermediate" | "advanced";
  language: "fr" | "mg" | "en";
  status: "draft" | "published";
  createdAt: Date;
  publishedAt: Date;
  trainer: {
    id: string;
    fullName: string;
    profession: string;
  };
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  sectionsCount?: number;
  lessonsCount?: number;
  totalDuration?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  group: string;
  courseCount: number;
}

export interface PaginatedCourses {
  courses: Course[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
