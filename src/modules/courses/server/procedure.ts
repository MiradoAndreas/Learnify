import { createTRPCRouter } from "@/trpc/init";
import {
  baseProcedure,
  protectedProcedure,
  teacherProcedure,
} from "@/trpc/init";
import { mux } from "@/lib/mux";
import { TRPCError } from "@trpc/server";

import { and, asc, desc, eq, ilike, inArray, lt, ne, or, SQL, sql } from "drizzle-orm";

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
      .limit(4); // Limite fixe à 4 cours

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
  getCourseResources: baseProcedure
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

  // Procédure 9: Cours similaires
  getRelatedCourses: baseProcedure
    .input(
      z.object({
        courseId: z.uuid(),
        limit: z.number().min(1).max(10).optional().default(4),
      })
    )
    .query(async ({ input }) => {
      const { courseId, limit } = input;

      // 1. Récupérer les catégories du cours
      const categories = await db
        .select({ categoryId: courseCategoryRelations.categoryId })
        .from(courseCategoryRelations)
        .where(eq(courseCategoryRelations.courseId, courseId));

      if (categories.length === 0) return [];

      // 2. Récupérer les cours similaires par catégorie
      const relatedCourses = await db
        .select({
          id: courses.id,
          title: courses.title,
          description: courses.description,
          price: courses.price,
          thumbnailUrl: courses.thumbnailUrl,
          level: courses.level,
          trainer: {
            fullName: trainerProfiles.fullName,
          },
        })
        .from(courses)
        .innerJoin(trainerProfiles, eq(courses.trainerId, trainerProfiles.id))
        .innerJoin(
          courseCategoryRelations,
          eq(courseCategoryRelations.courseId, courses.id)
        )
        .where(
          and(
            eq(courses.status, "published"),
            eq(courseCategoryRelations.categoryId, categories[0].categoryId),
            ne(courses.id, courseId)
          )
        )
        .limit(limit)
        .groupBy(courses.id, trainerProfiles.fullName);

      return relatedCourses;
    }),
  //   getLessonById: baseProcedure
  //   .input(z.object({ 
  //     lessonId: z.string().uuid(),
  //     courseId: z.string().uuid()
  //   }))
  //   .query(async ({ input }) => {
  //     const { lessonId, courseId } = input;
  
  //     const [lesson] = await db
  //       .select({
  //         id: courseLessons.id,
  //         title: courseLessons.title,
  //         description: courseLessons.description,
  //         duration: courseLessons.duration,
  //         visibility: courseLessons.visibility,
  //         isPublished: courseLessons.isPublished,
  //         muxPlaybackId: courseLessons.muxPlaybackId, // ⚠️ Vérifiez que c'est bien récupéré
  //         muxAssetId: courseLessons.muxAssetId, // Optionnel
  //         muxStatus: courseLessons.muxStatus, // Optionnel
  //         thumbnailUrl: courseLessons.thumbnailUrl,
  //         thumbnailKey: courseLessons.thumbnailKey, // Optionnel
  //         position: courseLessons.position,
  //         sectionId: courseLessons.sectionId,
          
  //         // Vérifiez ces champs dans votre table
  //         // Si muxPlaybackId n'existe pas, utilisez un autre champ
  //         hasAccess: sql<boolean>`true`.as("hasAccess"),
          
  //         section: {
  //           title: courseSections.title,
  //           position: courseSections.position,
  //         },
  //         course: {
  //           id: courses.id,
  //           title: courses.title,
  //           price: courses.price,
  //         }
  //       })
  //       .from(courseLessons)
  //       .innerJoin(courseSections, eq(courseLessons.sectionId, courseSections.id))
  //       .innerJoin(courses, eq(courseSections.courseId, courses.id))
  //       .where(and(
  //         eq(courseLessons.id, lessonId),
  //         eq(courses.id, courseId),
  //         eq(courses.status, "published"),
  //         eq(courseLessons.isPublished, true)
  //       ))
  //       .limit(1);
  
  //     if (!lesson) {
  //       throw new TRPCError({
  //         code: "NOT_FOUND",
  //         message: "Leçon non trouvée",
  //       });
  //     }
  
  //     // Vérifiez si la vidéo est prête
  //     if (lesson.muxStatus !== "ready") {
  //       console.warn(`Leçon ${lessonId}: statut Mux = ${lesson.muxStatus}`);
  //     }
  
  //     return lesson;
  //   }),
  // // Récupérer les leçons gratuites d'un cours pour prévisualisation
  // getFreeLessons: baseProcedure
  //   .input(z.object({ courseId: z.string().uuid() }))
  //   .query(async ({ input }) => {
  //     const { courseId } = input;

  //     const freeLessons = await db
  //       .select({
  //         id: courseLessons.id,
  //         title: courseLessons.title,
  //         description: courseLessons.description,
  //         duration: courseLessons.duration,
  //         thumbnailUrl: courseLessons.thumbnailUrl,
  //         muxPlaybackId: courseLessons.muxPlaybackId,
  //         position: courseLessons.position,
  //         section: {
  //           title: courseSections.title,
  //           position: courseSections.position,
  //         },
  //       })
  //       .from(courseLessons)
  //       .innerJoin(
  //         courseSections,
  //         eq(courseLessons.sectionId, courseSections.id)
  //       )
  //       .innerJoin(courses, eq(courseSections.courseId, courses.id))
  //       .where(
  //         and(
  //           eq(courses.id, courseId),
  //           eq(courses.status, "published"),
  //           eq(courseLessons.isPublished, true),
  //           eq(courseLessons.visibility, "free")
  //         )
  //       )
  //       .orderBy(asc(courseSections.position), asc(courseLessons.position))
  //       .limit(5); // Limite pour éviter de charger trop de leçons

  //     return freeLessons;
  //   }),
});
