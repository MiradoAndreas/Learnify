"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CourseDetailsForm } from "../components/course-edit-form";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CourseIdSectionProps {
  courseId: string;
}

export const CourseIdSection = ({ courseId }: CourseIdSectionProps) => {
  return (
    <Suspense fallback={<CourseIdSectionSkeleton />}>
      <ErrorBoundary fallback={<CourseIdSectionError />}>
        <CourseIdSectionSuspense courseId={courseId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const CourseIdSectionSkeleton = () => {
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Back Button Skeleton */}
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Header Skeleton */}
        <div className="mb-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-14 h-14 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-10 w-64" />
                  <Skeleton className="h-4 w-96" />
                </div>
              </div>

              {/* Alert Skeleton */}
              <Card className="border border-border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-5 h-5 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Buttons Skeleton */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-32 rounded-full" />
              <Skeleton className="h-10 w-40 rounded-full" />
            </div>
          </div>
        </div>

        {/* Progress Card Skeleton */}
        <div className="mb-8">
          <Card className="border border-border">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-6 h-6 rounded-full" />
                    <Skeleton className="h-7 w-48" />
                  </div>
                  <Skeleton className="h-4 w-72" />
                </div>

                <div className="text-center space-y-2">
                  <div className="relative inline-block">
                    <Skeleton className="h-12 w-24 rounded-xl" />
                  </div>
                  <Skeleton className="h-3 w-20 mx-auto" />
                </div>
              </div>

              {/* Progress Bar Skeleton */}
              <div className="mt-6 space-y-2">
                <Skeleton className="h-3 w-full rounded-full" />
                <div className="flex justify-between">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-3 w-16" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Tips Card Skeleton */}
          <div className="lg:col-span-1">
            <Card className="border border-border sticky top-6">
              <CardContent className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>

                {/* Tips List */}
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <div className="space-y-1 ml-2">
                        {[...Array(3)].map((_, j) => (
                          <Skeleton key={j} className="h-3 w-full" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Separator */}
                <Skeleton className="h-px w-full" />

                {/* Stats Card */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 mb-3">
                    <Skeleton className="w-5 h-5 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-3 w-20" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-5 w-10 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Main Form Skeleton */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tabs Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-7 gap-2 p-1 rounded-lg bg-muted/50">
              {[...Array(7)].map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>

            {/* Main Form Card Skeleton */}
            <Card className="border border-border">
              {/* Card Header */}
              <CardHeader className="border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-3 w-64" />
                    </div>
                  </div>
                  <Skeleton className="w-5 h-5 rounded-full" />
                </div>
              </CardHeader>

              {/* Card Content */}
              <CardContent className="p-8 space-y-8">
                {/* Title Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-14 w-full rounded-lg" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                </div>

                {/* Description Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-48 w-full rounded-lg" />
                </div>

                {/* Price Section */}
                <div className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-24 rounded-lg" />
                    ))}
                  </div>
                  <Skeleton className="h-14 w-full rounded-lg" />
                </div>

                {/* Level & Language Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-40" />
                    <div className="grid grid-cols-3 gap-3">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-20 rounded-lg" />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-40" />
                    <div className="grid grid-cols-3 gap-3">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-20 rounded-lg" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Skeleton className="h-16 w-full rounded-lg" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const CourseIdSectionError = () => {
  return (
    <div className="w-full">
      <Card className="border-2 border-destructive/20 bg-destructive/5">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-destructive mb-2">
            Erreur de chargement
          </h3>
          <p className="text-muted-foreground mb-4">
            Impossible de charger les détails du cours.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Réessayer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const CourseIdSectionSuspense = ({ courseId }: CourseIdSectionProps) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.teacher.getCourseDetails.queryOptions({ id: courseId })
  );

  const course = data as {
    id: string;
    title: string;
    description: string;
    price: number;
    level: "beginner" | "intermediate" | "advanced";
    language: "fr" | "mg" | "en";
    status: "draft" | "published";
    categories: { id: string; name: string; slug: string }[];
    requirements: { id: string; text: string }[];
    objectives: { id: string; text: string }[];
    audiences: { id: string; text: string }[];
  };

  if (!course) return <p>Cours introuvable</p>;

  return (
    <div className="max-w-full space-y-6 bg-background text-foreground">
      <div>
        <Link

          href="/teacher/dashboard"
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour aux cours
        </Link>
      </div>

      <CourseDetailsForm course={course} />
    </div>
  );
};