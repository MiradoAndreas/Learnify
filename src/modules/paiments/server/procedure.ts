import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import {
  courses,
  courseEnrollments,
  payments,
  courseLessons,
  courseSections,
  courseLearningObjectives,
} from "@/db/schema";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { trainerProfiles } from "@/db/schema";

export const paymentRouter = createTRPCRouter({

  createCheckout: protectedProcedure
    .input(z.object({ courseId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.auth;

      const [course] = await db
        .select({
          id: courses.id,
          title: courses.title,
          price: courses.price,
          status: courses.status,
        })
        .from(courses)
        .where(
          and(
            eq(courses.id, input.courseId),
            eq(courses.status, "published")
          )
        )
        .limit(1);

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cours non trouvé ou non publié",
        });
      }

      if (course.price === 0) {
        return { free: true };
      }

      const [existingEnrollment] = await db
        .select({ id: courseEnrollments.id })
        .from(courseEnrollments)
        .where(
          and(
            eq(courseEnrollments.userId, user.id),
            eq(courseEnrollments.courseId, input.courseId),
            eq(courseEnrollments.status, "active")
          )
        )
        .limit(1);

      if (existingEnrollment) {
        return {
          alreadyPurchased: true,
          redirectTo: `/home/my-courses`,
        };
      }

      return {
        checkoutUrl: `/home/checkout/simulate?courseId=${input.courseId}`,
        course,
      };
    }),

    // ! Correct this because it need transaction
    simulateSuccessfulPayment: protectedProcedure
    .input(z.object({ courseId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.auth;
  
      // 1. Vérifier que le cours existe
      const [course] = await db
        .select({
          id: courses.id,
          price: courses.price,
        })
        .from(courses)
        .where(eq(courses.id, input.courseId))
        .limit(1);
  
      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cours non trouvé",
        });
      }
  
      // 2. Vérifier si déjà inscrit
      const [existingEnrollment] = await db
        .select()
        .from(courseEnrollments)
        .where(
          and(
            eq(courseEnrollments.userId, user.id),
            eq(courseEnrollments.courseId, input.courseId)
          )
        )
        .limit(1);
  
      if (existingEnrollment) {
        return {
          success: true,
          alreadyEnrolled: true,
          enrollment: existingEnrollment,
        };
      }
  
      // 3. Créer le paiement simulé
      const [payment] = await db
        .insert(payments)
        .values({
          userId: user.id,
          courseId: input.courseId,
          amount: course.price,
          fees: 0,
          netAmount: course.price,
          provider: "simulation",
          externalTransactionId: `sim_${Date.now()}_${crypto.randomUUID()}`,
          status: "confirmed",
          confirmedAt: new Date(),
        })
        .returning();
  
      // 4. Créer l'inscription
      const [enrollment] = await db
        .insert(courseEnrollments)
        .values({
          userId: user.id,
          courseId: input.courseId,
          status: "active",
          activatedAt: new Date(),
        })
        .returning();
  
      return {
        success: true,
        payment,
        enrollment,
      };
    }),

    // Dans ton payment-router
getMyCourses: protectedProcedure.query(async ({ ctx }) => {
  const { user } = ctx.auth;

  // 1. Récupérer les inscriptions avec les infos de base des cours
  const enrollments = await db
    .select({
      // Infos d'inscription
      enrollmentId: courseEnrollments.id,
      activatedAt: courseEnrollments.activatedAt,
      
      // Infos du cours
      course: {
        id: courses.id,
        title: courses.title,
        description: courses.description,
        level: courses.level,
        language: courses.language,
        thumbnailUrl: courses.thumbnailUrl,
        trainerId: courses.trainerId,
      },
      
      // ID du formateur pour la jointure
      trainerId: courses.trainerId,
    })
    .from(courseEnrollments)
    .innerJoin(courses, eq(courses.id, courseEnrollments.courseId))
    .where(
      and(
        eq(courseEnrollments.userId, user.id),
        eq(courseEnrollments.status, "active")
      )
    )
    .orderBy(desc(courseEnrollments.createdAt));

  if (enrollments.length === 0) {
    return [];
  }

  // 2. Récupérer les infos des formateurs
  const trainerIds = enrollments.map(e => e.course.trainerId);
  const trainers = await db
    .select({
      id: trainerProfiles.id,
      fullName: trainerProfiles.fullName,
      profession: trainerProfiles.profession,
      image: trainerProfiles.image,
    })
    .from(trainerProfiles)
    .where(inArray(trainerProfiles.id, trainerIds));

  // 3. Créer un map des formateurs
  const trainerMap = new Map(
    trainers.map(t => [t.id, {
      fullName: t.fullName,
      profession: t.profession,
      image: t.image,
    }])
  );

  // 4. Pour chaque cours, récupérer le nombre de leçons
  const coursesWithDetails = await Promise.all(
    enrollments.map(async (enrollment) => {
      const courseId = enrollment.course.id;
      
      // Compter les leçons publiées
      const [lessonCount] = await db
        .select({
          count: sql<number>`COUNT(DISTINCT ${courseLessons.id})`,
        })
        .from(courses)
        .leftJoin(courseSections, eq(courseSections.courseId, courses.id))
        .leftJoin(courseLessons, eq(courseLessons.sectionId, courseSections.id))
        .where(
          and(
            eq(courses.id, courseId),
            eq(courseLessons.isPublished, true)
          )
        )
        .groupBy(courses.id);

      // Trouver le formateur
      const trainer = trainerMap.get(enrollment.course.trainerId) || {
        fullName: "Formateur",
        profession: "Expert",
        image: null,
      };

      // Progression (pour l'instant 0, à implémenter plus tard)
      const progress = 0;

      return {
        id: enrollment.course.id,
        title: enrollment.course.title,
        description: enrollment.course.description,
        thumbnailUrl: enrollment.course.thumbnailUrl,
        level: enrollment.course.level,
        language: enrollment.course.language,
        trainer: {
          fullName: trainer.fullName,
          profession: trainer.profession,
          image: trainer.image,
        },
        progress: progress,
        totalLessons: Number(lessonCount?.count) || 0,
        // Optionnel : date d'activation pour affichage
        enrolledAt: enrollment.activatedAt,
      };
    })
  );

  return coursesWithDetails;
}),

  checkCourseAccess: protectedProcedure
    .input(z.object({ courseId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { user } = ctx.auth;

      const [course] = await db
        .select({
          id: courses.id,
          price: courses.price,
        })
        .from(courses)
        .where(eq(courses.id, input.courseId))
        .limit(1);

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cours non trouvé",
        });
      }

      if (course.price === 0) {
        return { hasAccess: true, reason: "free_course" };
      }

      const [enrollment] = await db
        .select({ id: courseEnrollments.id })
        .from(courseEnrollments)
        .where(
          and(
            eq(courseEnrollments.userId, user.id),
            eq(courseEnrollments.courseId, input.courseId),
            eq(courseEnrollments.status, "active")
          )
        )
        .limit(1);

      return {
        hasAccess: !!enrollment,
      };
    }),

  checkLessonAccess: protectedProcedure
    .input(z.object({ lessonId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { user } = ctx.auth;

      const [lesson] = await db
        .select({
          lessonId: courseLessons.id,
          visibility: courseLessons.visibility,
          isPublished: courseLessons.isPublished,
          courseId: courses.id,
          coursePrice: courses.price,
        })
        .from(courseLessons)
        .innerJoin(
          courseSections,
          eq(courseSections.id, courseLessons.sectionId)
        )
        .innerJoin(courses, eq(courses.id, courseSections.courseId))
        .where(eq(courseLessons.id, input.lessonId))
        .limit(1);

      if (!lesson) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Leçon non trouvée",
        });
      }

      if (!lesson.isPublished) {
        return { hasAccess: false };
      }

      if (lesson.visibility === "free" || lesson.coursePrice === 0) {
        return { hasAccess: true };
      }

      const [enrollment] = await db
        .select({ id: courseEnrollments.id })
        .from(courseEnrollments)
        .where(
          and(
            eq(courseEnrollments.userId, user.id),
            eq(courseEnrollments.courseId, lesson.courseId),
            eq(courseEnrollments.status, "active")
          )
        )
        .limit(1);

      return {
        hasAccess: !!enrollment,
      };
    }),
});