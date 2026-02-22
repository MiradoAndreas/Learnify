"use client";
import { ExpandableText } from "@/components/expanded-text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ExpandableRichText } from "@/modules/teachers/courses/lessons/ui/components/expanded-rich-text";

import { formatCourseDuration } from "@/modules/teachers/courses/lessons/ui/utils/format-duration";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BookOpen, Clock, Star, Users } from "lucide-react";
import Image from "next/image";
import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { motion } from "framer-motion"

interface CourseHeroSectionProps {
  courseId: string;
}

const CourseHeroSkeleton = () => {
  return (
    <div className="space-y-6">

      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-24 rounded-full" />
          ))}
        </div>
        <div className="pt-6 border-t">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>
    </div>
  );
};

const CourseHeroError = () => {
  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-center">
      <h3 className="text-lg font-semibold text-destructive mb-2">
        Impossible de charger le cours
      </h3>
      <p className="text-sm text-muted-foreground">
        Veuillez réessayer ou contacter le support
      </p>
    </div>
  );
};

export const CourseHeroSection = ({ courseId }: CourseHeroSectionProps) => {
  return (
    <Suspense fallback={<CourseHeroSkeleton />}>
      <ErrorBoundary fallback={<CourseHeroError />}>
        <CourseHeroSectionSuspense courseId={courseId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const CourseHeroSectionSuspense = ({ courseId }: CourseHeroSectionProps) => {
  const trpc = useTRPC();
  const [expanded, setExpanded] = useState(false);
  const { data: course } = useSuspenseQuery(
    trpc.course.getCourseBasicInfo.queryOptions({
      courseId,
    })
  );

  const levelLabels = {
    beginner: "Débutant",
    intermediate: "Intermédiaire",
    advanced: "Avancé",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 100 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: .6 }} className="space-y-6">
      {/* Badge niveau */}
      {course.level && (
        <Badge variant="secondary" className="bg-secondary/10 dark:bg-zinc-800 text-foreground dark:text-zinc-100 border-0">
          {levelLabels[course.level as keyof typeof levelLabels]}
        </Badge>
      )}

      {/* Titre et description */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-zinc-100">
          {course.title}
        </h1>
        <ExpandableRichText
          content={course.description}
          maxLines={2}
          className="text-muted-foreground dark:text-zinc-400"
        />
      </div>

      <Separator className="bg-border dark:bg-zinc-800" />

      {/* Métadonnées */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="space-y-1">
          <div className="flex items-center text-sm text-muted-foreground dark:text-zinc-400">
            <Clock className="h-4 w-4 mr-2" />
            Durée
          </div>
          <p className="font-medium text-foreground dark:text-zinc-200">
            {formatCourseDuration(course.duration)}
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center text-sm text-muted-foreground dark:text-zinc-400">
            <BookOpen className="h-4 w-4 mr-2" />
            Leçons
          </div>
          <p className="font-medium text-foreground dark:text-zinc-200">{course.totalLessons}</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center text-sm text-muted-foreground dark:text-zinc-400">
            <Star className="h-4 w-4 mr-2" />
            Niveau
          </div>
          <p className="font-medium capitalize text-foreground dark:text-zinc-200">{course.level}</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center text-sm text-muted-foreground dark:text-zinc-400">
            <Users className="h-4 w-4 mr-2" />
            Langue
          </div>
          <p className="font-medium uppercase text-foreground dark:text-zinc-200">{course.language}</p>
        </div>
      </div>

      {/* Catégories */}
      {course.categories && course.categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {course.categories.map((category) => (
            <Badge
              key={category.id}
              variant="outline"
              className="border-border dark:border-zinc-700 text-foreground dark:text-zinc-300 bg-transparent"
            >
              {category.name}
            </Badge>
          ))}
        </div>
      )}

      <Separator className="bg-border dark:bg-zinc-800" />

      {/* Prix et actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <div>
          <div className="text-3xl font-bold text-foreground dark:text-zinc-100">
            {course.price > 0 ? `${course.price} Ar` : "Gratuit"}
          </div>
          {course.price > 0 && (
            <p className="text-sm text-muted-foreground dark:text-zinc-400 mt-1">
              Accès permanent
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            size="lg"
            className="border-border dark:border-zinc-700 bg-transparent hover:bg-accent dark:hover:bg-zinc-800 text-foreground dark:text-zinc-200"
          >
            Ajouter aux favoris
          </Button>
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/80 text-white"
          >
            {course.price > 0 ? "S'inscrire" : "Commencer gratuitement"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};