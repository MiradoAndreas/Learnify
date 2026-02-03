"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CourseDetailsForm } from "../components/course-edit-form";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="min-h-screen w-full">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-4 w-32 bg-linear-to-r from-gray-200 to-gray-300 rounded-full" />
      </div>
      <div className="bg-linear-to-br from-gray-50 via-white to-orange-50/30 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {/* Logo Skeleton */}
                  <div className="relative">
                    <div className="w-14 h-14 bg-linear-to-r from-gray-200 to-gray-300 rounded-xl animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-64 bg-linear-to-r from-gray-200 to-gray-300 rounded-lg" />
                    <Skeleton className="h-4 w-96 bg-linear-to-r from-gray-200 to-gray-300 rounded" />
                  </div>
                </div>

                {/* Alert Skeleton */}
                <Card className="border-0 bg-linear-to-r from-gray-100 to-gray-200 animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Skeleton className="w-5 h-5 rounded-full bg-gray-300" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-48 bg-gray-300 rounded" />
                        <Skeleton className="h-3 w-full bg-gray-300 rounded" />
                        <Skeleton className="h-3 w-3/4 bg-gray-300 rounded" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Buttons Skeleton */}
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-32 bg-linear-to-r from-gray-200 to-gray-300 rounded-full" />
                <Skeleton className="h-10 w-40 bg-linear-to-r from-gray-200 to-gray-300 rounded-full" />
              </div>
            </div>
          </div>

          {/* Progress Card Skeleton */}
          <div className="mb-8">
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-linear-to-r from-gray-100 to-gray-200 animate-pulse">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-6 h-6 rounded-full bg-gray-300" />
                      <Skeleton className="h-7 w-48 bg-gray-300 rounded" />
                    </div>
                    <Skeleton className="h-4 w-72 bg-gray-300 rounded" />
                  </div>

                  <div className="text-center space-y-2">
                    <div className="relative inline-block">
                      <Skeleton className="h-12 w-24 bg-gray-300 rounded-xl" />
                    </div>
                    <Skeleton className="h-3 w-20 bg-gray-300 rounded mx-auto" />
                  </div>
                </div>

                {/* Progress Bar Skeleton */}
                <div className="mt-6">
                  <Skeleton className="h-3 w-full bg-gray-300 rounded-full" />
                  <div className="flex justify-between text-xs mt-2">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton
                        key={i}
                        className="h-3 w-16 bg-gray-300 rounded"
                      />
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
              <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-linear-to-r from-gray-100 to-gray-200 animate-pulse">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <Skeleton className="w-10 h-10 rounded-xl bg-gray-300" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32 bg-gray-300 rounded" />
                      <Skeleton className="h-3 w-24 bg-gray-300 rounded" />
                    </div>
                  </div>

                  {/* Tips List */}
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-40 bg-gray-300 rounded" />
                        <div className="space-y-1 ml-2">
                          {[...Array(3)].map((_, j) => (
                            <Skeleton
                              key={j}
                              className="h-3 w-full bg-gray-300 rounded"
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Separator */}
                  <div className="my-4">
                    <Skeleton className="h-px w-full bg-gray-300" />
                  </div>

                  {/* Stats Card */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-3">
                      <Skeleton className="w-5 h-5 rounded-full bg-gray-300" />
                      <Skeleton className="h-4 w-24 bg-gray-300 rounded" />
                    </div>
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <Skeleton className="h-3 w-20 bg-gray-300 rounded" />
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-12 bg-gray-300 rounded" />
                          <Skeleton className="h-5 w-10 bg-gray-300 rounded-full" />
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-linear-to-r from-gray-100 to-gray-200 p-1 rounded-2xl animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-300 rounded-xl"></div>
                ))}
              </div>

              {/* Main Form Card Skeleton */}
              <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-linear-to-r from-gray-100 to-gray-200 animate-pulse">
                {/* Card Header */}
                <div className="p-6 bg-linear-to-r from-gray-200 to-gray-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-12 h-12 rounded-xl bg-gray-400" />
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-48 bg-gray-400 rounded" />
                        <Skeleton className="h-3 w-64 bg-gray-400 rounded" />
                      </div>
                    </div>
                    <Skeleton className="w-5 h-5 rounded-full bg-gray-400" />
                  </div>
                </div>

                {/* Card Content */}
                <CardContent className="p-8 space-y-8">
                  {/* Title Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-6 w-40 bg-gray-300 rounded" />
                      <Skeleton className="h-6 w-16 bg-gray-300 rounded-full" />
                    </div>
                    <div className="relative">
                      <Skeleton className="h-14 w-full bg-gray-300 rounded-xl" />
                    </div>
                    <Skeleton className="h-16 w-full bg-gray-300/50 rounded-xl" />
                  </div>

                  {/* Description Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-6 w-48 bg-gray-300 rounded" />
                      <Skeleton className="h-6 w-16 bg-gray-300 rounded-full" />
                    </div>
                    <Skeleton className="h-48 w-full bg-gray-300 rounded-xl" />
                  </div>

                  {/* Price Section */}
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-32 bg-gray-300 rounded" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton
                          key={i}
                          className="h-24 bg-gray-300 rounded-xl"
                        />
                      ))}
                    </div>
                    <Skeleton className="h-14 w-full bg-gray-300 rounded-xl" />
                  </div>

                  {/* Level & Language Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-40 bg-gray-300 rounded" />
                      <div className="grid grid-cols-3 gap-3">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton
                            key={i}
                            className="h-20 bg-gray-300 rounded-xl"
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-40 bg-gray-300 rounded" />
                      <div className="grid grid-cols-3 gap-3">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton
                            key={i}
                            className="h-20 bg-gray-300 rounded-xl"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Category Section */}
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-40 bg-gray-300 rounded" />
                    <Skeleton className="h-24 w-full bg-gray-300 rounded-2xl" />
                    <Skeleton className="h-14 w-full bg-gray-300 rounded-xl" />
                  </div>

                  {/* Submit Button */}
                  <Skeleton className="h-16 w-full bg-gray-300 rounded-xl" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CourseIdSectionError = () => {
  return (
    <div className="w-full">
      <div className="space-y-6">
        <p>CourseIdSectionError...</p>
      </div>
    </div>
  );
};

const CourseIdSectionSuspense = ({ courseId }: CourseIdSectionProps) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.teacher.getCourseDetails.queryOptions({ id: courseId })
  );

  // 🔹 CAST explicite pour TS
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
    <div className="max-w-full space-y-6">
      <div>
        <Link
          prefetch
          href="/teacher/dashboard"
          className="flex items-center gap-2 text-gray-700 hover:text-[#feba45] transition-colors"
        >
          <ArrowLeftIcon /> Back to all courses
        </Link>
      </div>

      {/* Formulaire complet */}
      <CourseDetailsForm course={course} />
    </div>
  );
};
