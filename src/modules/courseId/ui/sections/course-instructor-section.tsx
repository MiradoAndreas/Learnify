"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Mail, CalendarDays, BookOpen } from "lucide-react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface CourseHeroSectionProps {
  courseId: string;
}

const CourseInstructorSkeleton = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-start gap-6">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-4 flex-1">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-5 w-36" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
};

const CourseInstructorError = () => {
  return (
    <div className="p-8">
      <p className="text-muted-foreground">
        Les informations du formateur sont temporairement indisponibles.
      </p>
    </div>
  );
};

export const CourseInstructorSection = ({
  courseId,
}: CourseHeroSectionProps) => {
  return (
    <Suspense fallback={<CourseInstructorSkeleton />}>
      <ErrorBoundary fallback={<CourseInstructorError />}>
        <CourseInstructorSectionSuspense courseId={courseId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const CourseInstructorSectionSuspense = ({
  courseId,
}: CourseHeroSectionProps) => {
  const trpc = useTRPC();
  const { data: instructor } = useSuspenseQuery(
    trpc.course.getCourseInstructor.queryOptions({
      courseId,
    })
  );

  const initials = instructor.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start gap-8">
        {/* Avatar */}
        <Avatar className="h-20 w-20 border">
          <AvatarImage 
            src={instructor.image || undefined} 
            alt={instructor.fullName}
          />
          <AvatarFallback className="text-lg">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Contenu principal */}
        <div className="flex-1 space-y-2 md:space-y-3">
          {/* Nom et profession */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">
              {instructor.fullName}
            </h2>
            <p className="text-muted-foreground">
              {instructor.profession}
            </p>
          </div>

          <Separator />

          {/* Informations de contact */}
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{instructor.email}</span>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>
                Formateur depuis {new Date(instructor.createdAt).getFullYear()}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>
                {instructor.totalCourses} formation{instructor.totalCourses > 1 ? 's' : ''} dispensée{instructor.totalCourses > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          

          {/* Expérience */}
          {instructor.experience && (
            <div className="space-y-2">
              <h3 className="font-medium">Expérience professionnelle</h3>
              <p className="text-muted-foreground leading-relaxed">
                {instructor.experience}
              </p>
            </div>
          )}

          {/* Compétences sous forme de liste */}
          {instructor.skills && instructor.skills.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Compétences clés</h3>
              <ul className="text-muted-foreground list-disc list-inside space-y-1">
                {instructor.skills.map((skill, index) => (
                  <li key={index} className="pl-2">{skill}</li>
                ))}
              </ul>
            </div>
          )}

<div className="">
            <p className="text-muted-foreground italic text-[15px]">
              "{instructor.bio}"
            </p>
          </div>
        </div>
      
      </div>
    </div>
  );
};