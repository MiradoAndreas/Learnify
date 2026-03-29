import { db } from "@/db";
import { courseLessons, courseSections, lessonProgress } from "@/db/schema";
import { createTRPCRouter, paidCourseProcedure } from "@/trpc/init";
import { and, asc, eq, sql } from "drizzle-orm";
import z from "zod";

export const lessonProgressRouter = createTRPCRouter({
  trackLessonProgress: paidCourseProcedure
    .input(
      z.object({
        courseId: z.uuid(),
        lessonId: z.uuid(),
        lastPosition: z.number().min(0),
        duration: z.number().positive(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.user.id;
      const { lessonId, lastPosition, duration } = input;

      const safePosition = Math.min(lastPosition, duration);
      const progressPercent = Math.floor((safePosition / duration) * 100);

      const isCompleted = progressPercent >= 100;
      const now = new Date();

      await db
        .insert(lessonProgress)
        .values({
          userId,
          lessonId,
          progress: isCompleted ? 100 : progressPercent,
          lastPosition: safePosition,
          status: isCompleted ? "completed" : "in_progress",
          completedAt: isCompleted ? now : null,
        })
        .onConflictDoUpdate({
          target: [lessonProgress.userId, lessonProgress.lessonId],
          set: {
            progress: isCompleted ? 100 : progressPercent,
            lastPosition: safePosition,
            status: isCompleted ? "completed" : "in_progress",
            completedAt: isCompleted
              ? sql`COALESCE(${lessonProgress.completedAt}, ${now})`
              : null,
            updatedAt: now,
          },
        });

      const [result] = await db
        .select()
        .from(lessonProgress)
        .where(
          and(
            eq(lessonProgress.userId, userId),
            eq(lessonProgress.lessonId, lessonId),
          ),
        )
        .limit(1);

      return result ?? null;
    }),

  getLessonProgress: paidCourseProcedure
    .input(
      z.object({
        courseId: z.uuid(),
        lessonId: z.uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth.user.id;
      const { lessonId } = input;

      const [progress] = await db
        .select()
        .from(lessonProgress)
        .where(
          and(
            eq(lessonProgress.userId, userId),
            eq(lessonProgress.lessonId, lessonId),
          ),
        )
        .limit(1);

      return progress ?? null;
    }),

  getCourseProgress: paidCourseProcedure
    .input(
      z.object({
        courseId: z.uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth.user.id;
      const { courseId } = input;

      const lessons = await db
        .select({
          lessonId: courseLessons.id,
          sectionPosition: courseSections.position,
          lessonPosition: courseLessons.position,
          progress: lessonProgress.progress,
          status: lessonProgress.status,
          completedAt: lessonProgress.completedAt,
        })
        .from(courseLessons)
        .innerJoin(
          courseSections,
          eq(courseLessons.sectionId, courseSections.id),
        )
        .leftJoin(
          lessonProgress,
          and(
            eq(lessonProgress.lessonId, courseLessons.id),
            eq(lessonProgress.userId, userId),
          ),
        )
        .where(
          and(
            eq(courseSections.courseId, courseId),
            eq(courseLessons.isPublished, true),
          ),
        )
        .orderBy(asc(courseSections.position), asc(courseLessons.position));

      const totalLessons = lessons.length;
      const completedLessons = lessons.filter(
        (l) => l.status === "completed",
      ).length;

      const overallProgress =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

      return {
        totalLessons,
        completedLessons,
        overallProgress,
        lessons: lessons.map((l) => ({
          lessonId: l.lessonId,
          progress: l.progress ?? 0,
          status: l.status ?? "in_progress",
          completedAt: l.completedAt ?? null,
        })),
      };
    }),
});
