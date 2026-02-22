"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Mail, CalendarDays, BookOpen } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { motion } from "framer-motion"

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
    .slice(0, 1);

  return (
    <motion.div initial={{ opacity: 0, y: 100 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: .6 }} className="space-y-8">
      <div className="flex flex-col md:flex-row items-start gap-8">
        {/* Avatar */}
        <Link href={`/home/teachers/${instructor.id}`}>
          <Avatar className="w-[112px] h-[112px] hover:scale-105 transition-all duration-200 border-2 border-background dark:border-zinc-800 shadow-sm dark:shadow-zinc-900/50">
            <AvatarImage
              src={instructor.image || undefined}
              alt={instructor.fullName}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/90 dark:bg-primary/80 font-semibold text-white text-3xl">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>

        {/* Contenu principal */}
        <div className="flex-1 space-y-2 md:space-y-3">
          {/* Nom et profession */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground dark:text-zinc-100">
              {instructor.fullName}
            </h2>
            <p className="text-muted-foreground dark:text-zinc-400">
              {instructor.profession}
            </p>
          </div>

          <Separator className="bg-border dark:bg-zinc-800" />

          {/* Informations de contact */}
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground dark:text-zinc-400">
              <Mail className="h-4 w-4" />
              <span>{instructor.email}</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground dark:text-zinc-400">
              <CalendarDays className="h-4 w-4" />
              <span>
                Formateur depuis {new Date(instructor.createdAt).getFullYear()}
              </span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground dark:text-zinc-400">
              <BookOpen className="h-4 w-4" />
              <span>
                {instructor.totalCourses} formation{instructor.totalCourses > 1 ? 's' : ''} dispensée{instructor.totalCourses > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Expérience */}
          {instructor.experience && (
            <div className="space-y-2">
              <h3 className="font-medium text-foreground dark:text-zinc-200">Expérience professionnelle</h3>
              <p className="text-muted-foreground dark:text-zinc-400 leading-relaxed">
                {instructor.experience}
              </p>
            </div>
          )}

          {/* Compétences sous forme de liste */}
          {instructor.skills && instructor.skills.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-foreground dark:text-zinc-200">Compétences clés</h3>
              <ul className="text-muted-foreground dark:text-zinc-400 list-disc list-inside space-y-1">
                {instructor.skills.map((skill, index) => (
                  <li key={index} className="pl-2">{skill}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="">
            <p className="text-muted-foreground dark:text-zinc-400 italic text-[15px]">
              "{instructor.bio}"
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};