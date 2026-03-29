import { createTRPCRouter, paidCourseProcedure } from "@/trpc/init";
import {
  baseProcedure,
  protectedProcedure,
  teacherProcedure,
} from "@/trpc/init";
import { mux } from "@/lib/mux";
import { TRPCError } from "@trpc/server";

import { and, asc, desc, eq, gt, ilike, inArray, lt, ne, or, SQL, sql } from "drizzle-orm";

import { db } from "@/db";

import {
  courseAttachments,
  courseCategories,
  courseCategoryRelations,
  courseInsertSchema,
  courseLearningObjectives,
  courseLessons,
  courseREquirements,
  courses,
  courseSections,
  courseTargetAudiences,
  createCourseSchema,
  lessonAttachments,
  trainerApplicationSchema,
  trainerProfiles,
  updateCourseDetailsSchema,
  updateCourseSettingsSchema,
  user,
} from "@/db/schema";
import { create } from "domain";
import z from "zod";
import { get } from "http";

import { UTApi } from "uploadthing/server";
import { DEFAULT_COURSE_LIMIT } from "@/constants";
import { LessonDetails, LessonNavigation, LessonVideo } from "../types/course.type";

export const coursesRouter = createTRPCRouter({
  // trpc/routers/course.ts
  getAllPublishedCourses: baseProcedure
  .input(
    z.object({
      cursor: z
        .object({
          id: z.uuid(),
          publishedAt: z.date(),
        })
        .nullish(),
      limit: z.number().min(1).max(1000),
      categoryId: z.uuid().optional(),
    })
  )
  .query(async ({ input }) => {
    const { cursor, limit, categoryId } = input;

    const data = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        price: courses.price,
        thumbnailUrl: courses.thumbnailUrl,
        level: courses.level,
        language: courses.language,
        publishedAt: courses.publishedAt,

        totalLessons: sql<number>`
          (
            SELECT COUNT(${courseLessons.id})
            FROM ${courseLessons}
            INNER JOIN ${courseSections}
              ON ${courseLessons.sectionId} = ${courseSections.id}
            WHERE ${courseSections.courseId} = ${courses.id}
          )
        `.as("totalLessons"),

        duration: sql<number>`
          COALESCE(
            (
              SELECT SUM(${courseLessons.duration})
              FROM ${courseLessons}
              INNER JOIN ${courseSections}
                ON ${courseLessons.sectionId} = ${courseSections.id}
              WHERE ${courseSections.courseId} = ${courses.id}
                AND ${courseLessons.duration} IS NOT NULL
            ),
            0
          )
        `.as("duration"),

        trainer: {
          fullName: trainerProfiles.fullName,
          profession: trainerProfiles.profession,
          image: sql<string | null>`
            COALESCE(
              ${trainerProfiles.image},
              ${user.image}
            )
          `.as("image"),
        },
      })
      .from(courses)
      .innerJoin(trainerProfiles, eq(courses.trainerId, trainerProfiles.id))
      .innerJoin(user, eq(trainerProfiles.userId, user.id))
      .where(
        and(
          eq(courses.status, "published"),
          categoryId
            ? inArray(
                courses.id,
                db
                  .select({ courseId: courseCategoryRelations.courseId })
                  .from(courseCategoryRelations)
                  .where(eq(courseCategoryRelations.categoryId, categoryId))
              )
            : undefined,
          cursor
            ? or(
                lt(courses.publishedAt, cursor.publishedAt),
                and(
                  eq(courses.publishedAt, cursor.publishedAt),
                  lt(courses.id, cursor.id)
                )
              )
            : undefined
        )
      )
      .orderBy(desc(courses.publishedAt), desc(courses.id))
      .limit(limit + 1);

    const hasMore = data.length > limit;
    const items = hasMore ? data.slice(0, -1) : data;
    const lastItem = items[items.length - 1];
    const nextCursor = hasMore && lastItem
      ? {
          id: lastItem.id,
          publishedAt: lastItem.publishedAt,
        }
      : null;

    // ⭐ RETOUR SIMPLIFIÉ : SEULEMENT items et nextCursor
    return {
      items,
      nextCursor,
    };
  }),
  getPublishedCourses: baseProcedure
  .input(
    z.object({
      categoryId: z.uuid().optional(),
    })
  )
  .query(async ({ input }) => {
    const { categoryId } = input;

    const data = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        price: courses.price,
        thumbnailUrl: courses.thumbnailUrl,
        level: courses.level,
        language: courses.language,
        publishedAt: courses.publishedAt,

        totalLessons: sql<number>`
          (
            SELECT COUNT(${courseLessons.id})
            FROM ${courseLessons}
            INNER JOIN ${courseSections}
              ON ${courseLessons.sectionId} = ${courseSections.id}
            WHERE ${courseSections.courseId} = ${courses.id}
          )
        `.as("totalLessons"),

        duration: sql<number>`
          COALESCE(
            (
              SELECT SUM(${courseLessons.duration})
              FROM ${courseLessons}
              INNER JOIN ${courseSections}
                ON ${courseLessons.sectionId} = ${courseSections.id}
              WHERE ${courseSections.courseId} = ${courses.id}
                AND ${courseLessons.duration} IS NOT NULL
            ),
            0
          )
        `.as("duration"),

        trainer: {
          fullName: trainerProfiles.fullName,
          profession: trainerProfiles.profession,
          image: sql<string | null>`
            COALESCE(
              ${trainerProfiles.image},
              ${user.image}
            )
          `.as("image"),
        },
      })
      .from(courses)
      .innerJoin(trainerProfiles, eq(courses.trainerId, trainerProfiles.id))
      .innerJoin(user, eq(trainerProfiles.userId, user.id))
      .where(
        and(
          eq(courses.status, "published"),
          categoryId
            ? inArray(
                courses.id,
                db
                  .select({ courseId: courseCategoryRelations.courseId })
                  .from(courseCategoryRelations)
                  .where(eq(courseCategoryRelations.categoryId, categoryId))
              )
            : undefined
        )
      )
      .orderBy(desc(courses.publishedAt), desc(courses.id))
      .limit(8); // Limite fixe à 4 cours

    return {
      items: data, // Retourne directement les 4 cours
    };
  }),



  getCourseDetailsForCard: baseProcedure
    .input(z.object({ courseId: z.uuid() }))
    .query(async ({ input }) => {
      const { courseId } = input;

      // Récupérer les informations de base du cours AVEC durée et nombre de leçons
      const [course] = await db
        .select({
          id: courses.id,
          title: courses.title,
          description: courses.description,
          price: courses.price,
          thumbnailUrl: courses.thumbnailUrl,
          level: courses.level,
          language: courses.language,
          createdAt: courses.createdAt,
          // Compter le nombre total de leçons
          totalLessons: sql<number>`
          (
            SELECT COUNT(${courseLessons.id})
            FROM ${courseLessons}
            INNER JOIN ${courseSections} 
              ON ${courseLessons.sectionId} = ${courseSections.id}
            WHERE ${courseSections.courseId} = ${courses.id}
          )
        `.as("totalLessons"),
          // Calculer la durée totale en millisecondes
          duration: sql<number>`
          COALESCE(
            (
              SELECT SUM(${courseLessons.duration})
              FROM ${courseLessons}
              INNER JOIN ${courseSections} 
                ON ${courseLessons.sectionId} = ${courseSections.id}
              WHERE ${courseSections.courseId} = ${courses.id}
                AND ${courseLessons.duration} IS NOT NULL
            ), 
            0
          )
        `.as("duration"),
          trainer: {
            id: trainerProfiles.id,
            fullName: trainerProfiles.fullName,
            profession: trainerProfiles.profession,
            image: sql<string | null>`
            COALESCE(
              ${trainerProfiles.image},
              ${user.image}
            )
          `.as("image"),
          },
        })
        .from(courses)
        .innerJoin(trainerProfiles, eq(courses.trainerId, trainerProfiles.id))
        .innerJoin(user, eq(trainerProfiles.userId, user.id))
        .where(and(eq(courses.id, courseId), eq(courses.status, "published")))
        .limit(1);

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cours non trouvé",
        });
      }

      // Récupérer les détails supplémentaires
      const objectives = await db
        .select({ text: courseLearningObjectives.text })
        .from(courseLearningObjectives)
        .where(eq(courseLearningObjectives.courseId, courseId))
        .orderBy(asc(courseLearningObjectives.position))
        .limit(4);

      return {
        ...course,
        objectives: objectives.map((o) => o.text),
        rating: 0,
        totalReviews: 0,
        trainer: {
          ...course.trainer,
          rating: 0,
          totalStudents: 0,
        },
      };
    }),
  // Procédure 1: Informations de base du cours
  getCourseBasicInfo: baseProcedure
    .input(z.object({ courseId: z.uuid() }))
    .query(async ({ input }) => {
      const { courseId } = input;

      const [course] = await db
        .select({
          id: courses.id,
          title: courses.title,
          description: courses.description,
          price: courses.price,
          level: courses.level,
          language: courses.language,
          status: courses.status,
          thumbnailUrl: courses.thumbnailUrl,
          createdAt: courses.createdAt,
          publishedAt: courses.publishedAt,

          // Statistiques
          totalLessons: sql<number>`
          (
            SELECT COUNT(${courseLessons.id})
          FROM ${courseLessons}
          INNER JOIN ${courseSections} ON ${courseLessons.sectionId} = ${courseSections.id}
          WHERE ${courseSections.courseId} = ${courses.id}
            AND ${courseLessons.isPublished} = true
          )
        `.as("totalLessons"),

          duration: sql<number>`
          COALESCE(
            (
              SELECT SUM(${courseLessons.duration})
            FROM ${courseLessons}
            INNER JOIN ${courseSections} ON ${courseLessons.sectionId} = ${courseSections.id}
            WHERE ${courseSections.courseId} = ${courses.id}
              AND ${courseLessons.isPublished} = true
              AND ${courseLessons.duration} IS NOT NULL
          
            ), 0)
        `.as("duration"),

          // Catégories
          categories: sql<{ id: string; name: string }[]>`
          COALESCE(
            json_agg(
              json_build_object(
                'id', ${courseCategories.id},
                'name', ${courseCategories.name}
              )
            ) FILTER (WHERE ${courseCategories.id} IS NOT NULL),
            '[]'::json
          )
        `.as("categories"),
        })
        .from(courses)
        .leftJoin(
          courseCategoryRelations,
          eq(courseCategoryRelations.courseId, courses.id)
        )
        .leftJoin(
          courseCategories,
          eq(courseCategoryRelations.categoryId, courseCategories.id)
        )
        .where(and(eq(courses.id, courseId), eq(courses.status, "published")))
        .groupBy(courses.id)
        .limit(1);

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cours non trouvé ou non publié",
        });
      }

      return course;
    }),

  // Procédure 2: Informations du professeur
  getCourseInstructor: baseProcedure
    .input(z.object({ courseId: z.uuid() }))
    .query(async ({ input }) => {
      const { courseId } = input;

      const [instructor] = await db
        .select({
          id: trainerProfiles.id,
          fullName: trainerProfiles.fullName,
          profession: trainerProfiles.profession,
          bio: trainerProfiles.bio,
          experience: trainerProfiles.experience,
          skills: trainerProfiles.skills,
          image: sql<string | null>`
          COALESCE(
            ${trainerProfiles.image},
            ${user.image}
          )
        `.as("image"),
          email: user.email,
          createdAt: trainerProfiles.createdAt,

          totalCourses: sql<number>`(
          SELECT COUNT(*)
          FROM ${sql.identifier("courses")} c
          WHERE c.${sql.identifier("trainer_id")} = ${trainerProfiles.id}
            AND c.${sql.identifier("status")} = 'published'
        )`.as("totalCourses"),
        })
        .from(courses)
        .innerJoin(trainerProfiles, eq(courses.trainerId, trainerProfiles.id))
        .innerJoin(user, eq(trainerProfiles.userId, user.id))
        .where(and(eq(courses.id, courseId), eq(courses.status, "published")))
        .limit(1);

      if (!instructor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Professeur non trouvé",
        });
      }

      return instructor;
    }),

  // Procédure 3: Objectifs d'apprentissage
  getCourseObjectives: baseProcedure
    .input(z.object({ courseId: z.uuid() }))
    .query(async ({ input }) => {
      const { courseId } = input;

      const objectives = await db
        .select({
          id: courseLearningObjectives.id,
          text: courseLearningObjectives.text,
          position: courseLearningObjectives.position,
        })
        .from(courseLearningObjectives)
        .innerJoin(courses, eq(courses.id, courseLearningObjectives.courseId))
        .where(
          and(
            eq(courseLearningObjectives.courseId, courseId),
            eq(courses.status, "published")
          )
        )
        .orderBy(asc(courseLearningObjectives.position));

      return objectives;
    }),

  // Procédure 4: Compétences acquises
  getCourseCompetences: baseProcedure
    .input(z.object({ courseId: z.uuid() }))
    .query(async ({ input }) => {
      const { courseId } = input;

      const competences = await db
        .select({
          id: courseREquirements.id,
          text: courseREquirements.text,
        })
        .from(courseREquirements)
        .innerJoin(courses, eq(courses.id, courseREquirements.courseId))
        .where(
          and(
            eq(courseREquirements.courseId, courseId),
            eq(courses.status, "published")
          )
        );

      console.log(competences);

      return competences;
    }),

  // Procédure 5: Public cible
  getCourseAudience: baseProcedure
    .input(z.object({ courseId: z.uuid() }))
    .query(async ({ input }) => {
      const { courseId } = input;

      const audience = await db
        .select({
          id: courseTargetAudiences.id,
          text: courseTargetAudiences.text,
        })
        .from(courseTargetAudiences)
        .innerJoin(courses, eq(courses.id, courseTargetAudiences.courseId))
        .where(
          and(
            eq(courseTargetAudiences.courseId, courseId),
            eq(courses.status, "published")
          )
        );

      return audience;
    }),

  // Procédure 6: Curriculum (sections + leçons)
  getCourseCurriculum: baseProcedure
    .input(z.object({ courseId: z.uuid() }))
    .query(async ({ input }) => {
      const { courseId } = input;

      const sections = await db
        .select({
          id: courseSections.id,
          title: courseSections.title,
          position: courseSections.position,

          lessons: sql<any[]>`
          COALESCE(
            json_agg(
              json_build_object(
                'id', ${courseLessons.id},
                'title', ${courseLessons.title},
                'description', ${courseLessons.description},
                'position', ${courseLessons.position},
                'duration', ${courseLessons.duration},
                'visibility', ${courseLessons.visibility},
                'isPublished', ${courseLessons.isPublished},
                'muxPlaybackId', ${courseLessons.muxPlaybackId},
                'thumbnailUrl', ${courseLessons.thumbnailUrl},
                'createdAt', ${courseLessons.createdAt}
              )
              ORDER BY ${courseLessons.position}
            ) FILTER (WHERE ${courseLessons.id} IS NOT NULL AND ${courseLessons.isPublished} = true),
            '[]'::json
          )
        `.as("lessons"),
        })
        .from(courseSections)
        .innerJoin(courses, eq(courses.id, courseSections.courseId))
        .leftJoin(courseLessons, eq(courseLessons.sectionId, courseSections.id))
        .where(
          and(
            eq(courseSections.courseId, courseId),
            eq(courses.status, "published")
          )
        )
        .groupBy(
          courseSections.id,
          courseSections.title,
          courseSections.position
        )
        .orderBy(asc(courseSections.position));

      return sections;
    }),

  // Procédure 7: Ressources du cours
  getCourseResourcesPublic: baseProcedure
    .input(z.object({ courseId: z.uuid() }))
    .query(async ({ input }) => {
      const { courseId } = input;

      const [courseAttachmentsList, lessonAttachmentsList] = await Promise.all([
        // Ressources du cours
        db
          .select({
            id: courseAttachments.id,
            name: courseAttachments.name,
            attachmentUrl: courseAttachments.attachmentUrl,
            type: courseAttachments.type,
            size: courseAttachments.size,
            createdAt: courseAttachments.createdAt,
          })
          .from(courseAttachments)
          .innerJoin(courses, eq(courses.id, courseAttachments.courseId))
          .where(
            and(
              eq(courseAttachments.courseId, courseId),
              eq(courses.status, "published")
            )
          )
          .orderBy(desc(courseAttachments.createdAt)),

        // Ressources des leçons
        db
          .select({
            lessonId: courseLessons.id,
            lessonTitle: courseLessons.title,
            attachmentId: lessonAttachments.id,
            attachmentName: lessonAttachments.name,
            attachmentUrl: lessonAttachments.attachmentUrl,
            type: lessonAttachments.type,
            size: lessonAttachments.size,
            createdAt: lessonAttachments.createdAt,
          })
          .from(courseLessons)
          .innerJoin(
            courseSections,
            eq(courseLessons.sectionId, courseSections.id)
          )
          .innerJoin(courses, eq(courses.id, courseSections.courseId))
          .leftJoin(
            lessonAttachments,
            eq(lessonAttachments.lessonId, courseLessons.id)
          )
          .where(
            and(
              eq(courseSections.courseId, courseId),
              eq(courses.status, "published"),
              eq(courseLessons.isPublished, true)
            )
          )
          .orderBy(courseLessons.position, asc(lessonAttachments.createdAt)),
      ]);

      return {
        courseAttachments: courseAttachmentsList,
        lessonAttachments: lessonAttachmentsList.filter(
          (la) => la.attachmentId !== null
        ),
      };
    }),

  // Procédure 8: Avis et évaluations (exemple de structure)
  getCourseReviews: baseProcedure
    .input(
      z.object({
        courseId: z.uuid(),
        limit: z.number().min(1).max(50).optional().default(10),
        page: z.number().min(1).optional().default(1),
      })
    )
    .query(async ({ input }) => {
      const { courseId, limit, page } = input;
      const offset = (page - 1) * limit;

      // Exemple de structure pour les avis (à adapter à votre base)
      return {
        averageRating: 4.5,
        totalReviews: 42,
        reviews: [],
        // Vous pouvez ajouter ici la logique pour récupérer les avis
      };
    }),

    getPublishedCoursesByTeacher: baseProcedure
  .input(
    z.object({
      teacherId: z.uuid(),
      cursor: z
        .object({
          id: z.uuid(),
          publishedAt: z.date(),
        })
        .nullish(),
      limit: z.number().min(1).max(100).default(DEFAULT_COURSE_LIMIT),
    })
  )
  .query(async ({ input }) => {
    const { teacherId, cursor, limit } = input;

    // Vérifier que le professeur existe
    const [teacher] = await db
      .select({
        id: trainerProfiles.id,
        fullName: trainerProfiles.fullName,
        status: trainerProfiles.status,
      })
      .from(trainerProfiles)
      .where(eq(trainerProfiles.id, teacherId))
      .limit(1);

    if (!teacher) {
      // Retourner un tableau vide au lieu de throw pour éviter les problèmes de déshydratation
      return {
        items: [],
        nextCursor: null,
      };
    }

    const [totalResult] = await db
    .select({ count: sql<number>`COUNT(*)`.as("count") })
    .from(courses)
    .where(
      and(
        eq(courses.trainerId, teacherId),
        eq(courses.status, "published")
      )
    );

    // Construire les conditions WHERE
    const whereConditions: SQL[] = [
      eq(courses.trainerId, teacherId),
      eq(courses.status, "published"),
    ];

    // Pagination cursor-based
    if (cursor) {
      const paginationCondition = or(
        lt(courses.publishedAt, cursor.publishedAt),
        and(
          eq(courses.publishedAt, cursor.publishedAt),
          lt(courses.id, cursor.id)
        )
      );
    
      if (paginationCondition) {
        whereConditions.push(paginationCondition);
      }
    }
    

    // Récupérer les données avec pagination
    const data = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        price: courses.price,
        thumbnailUrl: courses.thumbnailUrl,
        level: courses.level,
        language: courses.language,
        publishedAt: courses.publishedAt,

        totalLessons: sql<number>`
          (
            SELECT COUNT(${courseLessons.id})
            FROM ${courseLessons}
            INNER JOIN ${courseSections}
              ON ${courseLessons.sectionId} = ${courseSections.id}
            WHERE ${courseSections.courseId} = ${courses.id}
          )
        `.as("totalLessons"),

        duration: sql<number>`
          COALESCE(
            (
              SELECT SUM(${courseLessons.duration})
              FROM ${courseLessons}
              INNER JOIN ${courseSections}
                ON ${courseLessons.sectionId} = ${courseSections.id}
              WHERE ${courseSections.courseId} = ${courses.id}
                AND ${courseLessons.duration} IS NOT NULL
            ),
            0
          )
        `.as("duration"),

        // Informations du professeur
        trainer: {
          fullName: trainerProfiles.fullName,
          profession: trainerProfiles.profession,
          image: sql<string | null>`
            COALESCE(
              ${trainerProfiles.image},
              ${user.image}
            )
          `.as("image"),
        },
      })
      .from(courses)
      .innerJoin(trainerProfiles, eq(courses.trainerId, trainerProfiles.id))
      .innerJoin(user, eq(trainerProfiles.userId, user.id))
      .where(and(...whereConditions))
      .orderBy(desc(courses.publishedAt), desc(courses.id))
      .limit(limit + 1); // +1 pour vérifier s'il y a plus de données

    // Même logique de pagination que getAllPublishedCourses
    const hasMore = data.length > limit;
    const items = hasMore ? data.slice(0, -1) : data;
    const lastItem = items[items.length - 1];
    const nextCursor = hasMore && lastItem
      ? {
          id: lastItem.id,
          publishedAt: lastItem.publishedAt,
        }
      : null;

    // Retourner exactement le même format que getAllPublishedCourses
    return {
      items,
      nextCursor,
      total: totalResult?.count || 0
    };
  }),
  revalidate: teacherProcedure
  .input(
    z.object({
      id: z.uuid(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { id: trainerId } = ctx.trainer;

    // Récupérer la leçon avec vérification de l'appartenance au cours du formateur
    const [existingLesson] = await db
      .select({
        lesson: courseLessons,
        courseTrainerId: courses.trainerId,
      })
      .from(courseLessons)
      .innerJoin(courseSections, eq(courseLessons.sectionId, courseSections.id))
      .innerJoin(courses, eq(courseSections.courseId, courses.id))
      .where(
        and(
          eq(courseLessons.id, input.id),
          eq(courses.trainerId, trainerId)
        )
      )
      .limit(1);

    if (!existingLesson) {
      throw new TRPCError({ 
        code: "NOT_FOUND",
        message: "Leçon non trouvée ou vous n'y avez pas accès" 
      });
    }

    // Vérifier si la leçon a un muxUploadId
    if (!existingLesson.lesson.muxUploadId) {
      throw new TRPCError({ 
        code: "BAD_REQUEST",
        message: "La leçon n'a pas d'identifiant de téléchargement Mux" 
      });
    }

    // Récupérer l'upload depuis Mux
    const upload = await mux.video.uploads.retrieve(
      existingLesson.lesson.muxUploadId
    );

    if (!upload || !upload.asset_id) {
      throw new TRPCError({ 
        code: "BAD_REQUEST",
        message: "Upload Mux non trouvé ou sans asset ID" 
      });
    }

    // Récupérer l'asset depuis Mux
    const asset = await mux.video.assets.retrieve(upload.asset_id);

    if (!asset) {
      throw new TRPCError({ 
        code: "BAD_REQUEST",
        message: "Asset Mux non trouvé" 
      });
    }

    const playbackId = asset.playback_ids?.[0]?.id || null;
    const duration = asset.duration ? Math.round(asset.duration * 1000) : 0;

    // Mettre à jour la leçon avec les informations de Mux
    const [updatedLesson] = await db
      .update(courseLessons)
      .set({
        muxStatus: asset.status,
        muxPlaybackId: playbackId,
        muxAssetId: asset.id,
        duration: duration,
      })
      .where(eq(courseLessons.id, input.id))
      .returning();

    if (!updatedLesson) {
      throw new TRPCError({ 
        code: "INTERNAL_SERVER_ERROR",
        message: "Échec de la mise à jour de la leçon" 
      });
    }

    return updatedLesson;
  }),

  getMyCourseById: protectedProcedure
  .input(z.object({ courseId: z.uuid() }))
  .query(async ({ input }) => {
    const { courseId } = input;

    const [course] = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        price: courses.price,
        level: courses.level,
        language: courses.language,
        status: courses.status,
        thumbnailUrl: courses.thumbnailUrl,
        createdAt: courses.createdAt,
        publishedAt: courses.publishedAt,


        duration: sql<number>`
        COALESCE(
          (
            SELECT SUM(${courseLessons.duration})
          FROM ${courseLessons}
          INNER JOIN ${courseSections} ON ${courseLessons.sectionId} = ${courseSections.id}
          WHERE ${courseSections.courseId} = ${courses.id}
            AND ${courseLessons.isPublished} = true
            AND ${courseLessons.duration} IS NOT NULL
        
          ), 0)
      `.as("duration"),
      })
      .from(courses)
      .leftJoin(
        courseCategoryRelations,
        eq(courseCategoryRelations.courseId, courses.id)
      )
      .leftJoin(
        courseCategories,
        eq(courseCategoryRelations.categoryId, courseCategories.id)
      )
      .where(and(eq(courses.id, courseId), eq(courses.status, "published")))
      .groupBy(courses.id)
      .limit(1);

    if (!course) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Cours non trouvé ou non publié",
      });
    }

    return course;
  }),

  // Dans votre coursesRouter, ajoutez ces 3 procédures :

/**
 * PROCÉDURE 1: getLessonVideo
 * Récupère uniquement les informations nécessaires pour la vidéo
 * Légère et rapide pour un chargement prioritaire
 */
getLessonVideo: paidCourseProcedure
  .input(z.object({ 
    courseId: z.uuid(),
    lessonId: z.uuid()
  }))
  .query(async ({ ctx, input }): Promise<LessonVideo> => {
    const { lessonId } = input;

    const [video] = await db
      .select({
        id: courseLessons.id,
        title: courseLessons.title,
        muxPlaybackId: courseLessons.muxPlaybackId,
        muxAssetId: courseLessons.muxAssetId,
        muxStatus: courseLessons.muxStatus,
        thumbnailUrl: courseLessons.thumbnailUrl,
        duration: courseLessons.duration,
        position: courseLessons.position,
        sectionId: courseLessons.sectionId,
        courseId: courseSections.courseId,
      })
      .from(courseLessons)
      .innerJoin(courseSections, eq(courseLessons.sectionId, courseSections.id))
      .innerJoin(courses, eq(courseSections.courseId, courses.id))
      .where(
        and(
          eq(courseLessons.id, lessonId),
          eq(courseLessons.isPublished, true),
          eq(courses.status, "published")
        )
      )
      .limit(1);

    if (!video) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Vidéo non trouvée",
      });
    }

    return video;
  }),

/**
* PROCÉDURE 2: getLessonDetails
* Récupère toutes les informations détaillées de la leçon
* (description, ressources, formateur, etc.)
*/
getLessonDetails: paidCourseProcedure
  .input(z.object({ 
    courseId: z.uuid(),
    lessonId: z.uuid()
  }))
  .query(async ({ ctx, input }) => {
    const { lessonId } = input;

    const [lesson] = await db
      .select({
        id: courseLessons.id,
        title: courseLessons.title,
        description: courseLessons.description,
        position: courseLessons.position,
        duration: courseLessons.duration,
        visibility: courseLessons.visibility,
        createdAt: courseLessons.createdAt,
        updatedAt: courseLessons.updatedAt,

        sectionId: courseSections.id,
        sectionTitle: courseSections.title,
        sectionPosition: courseSections.position,

        courseId: courses.id,
        courseTitle: courses.title,
        courseLevel: courses.level,
        courseLanguage: courses.language,

       
      })
      .from(courseLessons)
      .innerJoin(courseSections, eq(courseLessons.sectionId, courseSections.id))
      .innerJoin(courses, eq(courseSections.courseId, courses.id))
      
      .where(
        and(
          eq(courseLessons.id, lessonId),
          eq(courseLessons.isPublished, true),
          eq(courses.status, "published")
        )
      )
      .limit(1);

    if (!lesson) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Leçon non trouvée",
      });
    }

    const resources = await db
      .select({
        id: lessonAttachments.id,
        name: lessonAttachments.name,
        attachmentUrl: lessonAttachments.attachmentUrl,
        type: lessonAttachments.type,
        size: lessonAttachments.size,
        createdAt: lessonAttachments.createdAt,
      })
      .from(lessonAttachments)
      .where(eq(lessonAttachments.lessonId, lessonId))
      .orderBy(asc(lessonAttachments.createdAt));

    return {
      ...lesson,
      resources,
    };
  }),

/**
* PROCÉDURE 3: getLessonNavigation
* Récupère les informations de navigation (leçons précédente/suivante)
*/
getLessonNavigation: paidCourseProcedure
  .input(z.object({ 
    courseId: z.uuid(),
    lessonId: z.uuid()
  }))
  .query(async ({ input }) => {
    const { lessonId } = input;

    // 1. Récupérer la leçon courante avec son cours
    const [current] = await db
      .select({
        id: courseLessons.id,
        sectionId: courseLessons.sectionId,
        position: courseLessons.position,
        title: courseLessons.title,
        courseId: courseSections.courseId,
      })
      .from(courseLessons)
      .innerJoin(courseSections, eq(courseLessons.sectionId, courseSections.id))
      .where(
        and(
          eq(courseLessons.id, lessonId),
          eq(courseLessons.isPublished, true)
        )
      )
      .limit(1);

    if (!current) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Leçon non trouvée",
      });
    }

    // 2. Récupérer TOUTES les leçons du cours ENTIER, triées par section puis par position
    const allCourseLessons = await db
      .select({
        id: courseLessons.id,
        title: courseLessons.title,
        sectionId: courseLessons.sectionId,
        sectionTitle: courseSections.title,
        sectionPosition: courseSections.position,
        position: courseLessons.position,
        duration: courseLessons.duration,
      })
      .from(courseLessons)
      .innerJoin(courseSections, eq(courseLessons.sectionId, courseSections.id))
      .where(
        and(
          eq(courseSections.courseId, current.courseId),
          eq(courseLessons.isPublished, true)
        )
      )
      .orderBy(
        asc(courseSections.position),  // D'abord par ordre des sections
        asc(courseLessons.position)     // Puis par position dans la section
      );

    // 3. Si pas de leçons dans le cours (normalement ne devrait pas arriver)
    if (allCourseLessons.length === 0) {
      return {
        previousLesson: null,
        nextLesson: null,
        totalLessons: 0,
      };
    }

    // 4. Trouver l'index de la leçon courante dans la liste complète
    const currentIndex = allCourseLessons.findIndex(l => l.id === lessonId);
    
    // 5. Si la leçon n'est pas trouvée (ne devrait pas arriver)
    if (currentIndex === -1) {
      return {
        previousLesson: null,
        nextLesson: null,
        totalLessons: allCourseLessons.length,
      };
    }

    // 6. Déterminer la leçon précédente et suivante dans TOUT le cours
    const previousLesson = currentIndex > 0 
      ? {
          id: allCourseLessons[currentIndex - 1].id,
          title: allCourseLessons[currentIndex - 1].title,
          position: allCourseLessons[currentIndex - 1].position,
          duration: allCourseLessons[currentIndex - 1].duration,
        }
      : null;
      
    const nextLesson = currentIndex < allCourseLessons.length - 1 
      ? {
          id: allCourseLessons[currentIndex + 1].id,
          title: allCourseLessons[currentIndex + 1].title,
          position: allCourseLessons[currentIndex + 1].position,
          duration: allCourseLessons[currentIndex + 1].duration,
        }
      : null;

    return {
      previousLesson,
      nextLesson,
      totalLessons: allCourseLessons.length,
    };
  }),

  getCourseTitlByCourseId: baseProcedure
  .input(z.object({ 
    courseId: z.string().uuid()
  }))
  .query(async ({ input }) => {
    const { courseId } = input;

    const [course] = await db
      .select({
        id: courses.id,
        title: courses.title,
      })
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (!course) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Cours non trouvé",
      });
    }

    return course;
  }),
  getRessourcePrivate: paidCourseProcedure
    .input(z.object({ courseId: z.uuid() }))
    .query(async ({ input }) => {
      const { courseId } = input;

      const [courseAttachmentsList, lessonAttachmentsList] = await Promise.all([
        // Ressources du cours
        db
          .select({
            id: courseAttachments.id,
            name: courseAttachments.name,
            attachmentUrl: courseAttachments.attachmentUrl,
            type: courseAttachments.type,
            size: courseAttachments.size,
            createdAt: courseAttachments.createdAt,
          })
          .from(courseAttachments)
          .innerJoin(courses, eq(courses.id, courseAttachments.courseId))
          .where(
            and(
              eq(courseAttachments.courseId, courseId),
              eq(courses.status, "published")
            )
          )
          .orderBy(desc(courseAttachments.createdAt)),

        // Ressources des leçons
        db
          .select({
            lessonId: courseLessons.id,
            lessonTitle: courseLessons.title,
            attachmentId: lessonAttachments.id,
            attachmentName: lessonAttachments.name,
            attachmentUrl: lessonAttachments.attachmentUrl,
            type: lessonAttachments.type,
            size: lessonAttachments.size,
            createdAt: lessonAttachments.createdAt,
          })
          .from(courseLessons)
          .innerJoin(
            courseSections,
            eq(courseLessons.sectionId, courseSections.id)
          )
          .innerJoin(courses, eq(courses.id, courseSections.courseId))
          .leftJoin(
            lessonAttachments,
            eq(lessonAttachments.lessonId, courseLessons.id)
          )
          .where(
            and(
              eq(courseSections.courseId, courseId),
              eq(courses.status, "published"),
              eq(courseLessons.isPublished, true)
            )
          )
          .orderBy(courseLessons.position, asc(lessonAttachments.createdAt)),
      ]);

      return {
        courseAttachments: courseAttachmentsList,
        lessonAttachments: lessonAttachmentsList.filter(
          (la) => la.attachmentId !== null
        ),
      };
    }),
});
