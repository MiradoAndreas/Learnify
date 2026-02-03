import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
  teacherProcedure,
} from "@/trpc/init";
import { mux } from "@/lib/mux";
import { TRPCError } from "@trpc/server";

import { and, desc, eq, sql } from "drizzle-orm";

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
import { updateCourseSchema } from "../types/teacher-type";
import { UTApi } from "uploadthing/server";
import { lessonUpdateSchema } from "../courses/lessons/types/lesson-schema";

//todos: decide if we add session or user

export const teacherRouter = createTRPCRouter({
  // * Créer une demande de compte professeur
  createAccount: protectedProcedure
    .input(trainerApplicationSchema)
    .mutation(async ({ ctx, input }) => {
      // Vérifie si l'utilisateur a déjà une demande
      const { user } = ctx.auth;
      const existing = await db
        .select({ id: trainerProfiles.id })
        .from(trainerProfiles)
        .where(eq(trainerProfiles.userId, user.id))
        .limit(1);

      if (existing.length > 0) {
        throw new Error("Une demande existe déjà");
      }

      await db.insert(trainerProfiles).values({
        userId: user.id,
        fullName: input.fullName,
        profession: input.profession,
        experience: input.experience,
        bio: input.bio,
        skills: input.skills,
      });

      return {
        success: true,
        status: "pending",
      };
    }),

  // * Vérifier l'état du compte professeur
  getMyTrainerAccount: teacherProcedure.query(async ({ ctx }) => {
    return {
      id: ctx.trainer.id,
      status: ctx.trainer.status,
    };
  }),
  getTeacherRedirect: teacherProcedure.query(async ({ ctx }) => {
    const trainer = await db
      .select({
        status: trainerProfiles.status,
      })
      .from(trainerProfiles)
      .where(eq(trainerProfiles.userId, ctx.auth.user.id))
      .limit(1);
  
    if (trainer.length === 0) {
      return {
        status: "none",
        redirectTo: "/teacher/create",
      } as const;
    }
  
    const status = trainer[0].status;
  
    switch (status) {
      case "success":
        return {
          status,
          redirectTo: "/teacher/dashboard",
        } as const;
  
      case "pending":
        return {
          status,
          redirectTo: "/teacher/pending",
        } as const;
  
      default:
        return {
          status,
          redirectTo: "/teacher/create",
        } as const;
    }
  }),
  
  getMe: teacherProcedure.query(async ({ ctx }) => {
    const { user: currentUser } = ctx.auth;
  
    const [teacher] = await db
      .select({
        id: trainerProfiles.id,
        userId: trainerProfiles.userId,
        fullName: trainerProfiles.fullName,
        profession: trainerProfiles.profession,
        experience: trainerProfiles.experience,
        bio: trainerProfiles.bio,
        skills: trainerProfiles.skills,
        status: trainerProfiles.status,
        createdAt: trainerProfiles.createdAt,
        reviewedAt: trainerProfiles.reviewedAt,
        image: sql<string | null>`
          COALESCE(${trainerProfiles.image}, ${currentUser.image})
        `.as("image"),
      })
      .from(trainerProfiles)
      .innerJoin(user, eq(trainerProfiles.userId, user.id)) // table user SQL
      .where(eq(trainerProfiles.userId, currentUser.id)) // utilisateur connecté
      .limit(1);
  
    if (!teacher) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Compte professeur introuvable",
      });
    }
  
    if (teacher.status !== "success") { // ou pending selon ton enum
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Compte professeur non activé",
      });
    }
  
    return {
      id: teacher.id,
      profession: teacher.profession,
      fullName: teacher.fullName,
      image: teacher.image,
      email: currentUser.email,
      experience: teacher.experience,
    };
  }),
  getMyCourses: teacherProcedure.query(async ({ ctx }) => {
    const [trainer] = await db
      .select()
      .from(trainerProfiles)
      .where(eq(trainerProfiles.userId, ctx.auth.user.id));

    if (!trainer) return [];

    const coursess = await db
      .select({
        id: courses.id,
        title: courses.title,
        price: courses.price,
        status: courses.status,
        createdAt: courses.createdAt,
      })
      .from(courses)
      .where(eq(courses.trainerId, trainer.id))
      .orderBy(desc(courses.createdAt));

    return coursess;
  }),
  createCourse: teacherProcedure
    .input(
      z.object({
        title: z.string().min(5, "Title is required"),
        description: z.string().min(20, "Description is required"),
        price: z.number().min(0, "Price is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.auth;

      const [trainer] = await db
        .select()
        .from(trainerProfiles)
        .where(eq(trainerProfiles.userId, user.id));

      if (!trainer)
        throw new TRPCError({ code: "FORBIDDEN", message: "Pas de compte" });

      const [course] = await db
        .insert(courses)
        .values({
          title: input.title,
          price: input.price,
          description: input.description,
          trainerId: trainer.id,
          status: "draft",
        })
        .returning();

      return course;
    }),
  deleteCourse: teacherProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.auth;

      const [trainer] = await db
        .select()
        .from(trainerProfiles)
        .where(eq(trainerProfiles.userId, user.id));

      if (!trainer)
        throw new TRPCError({ code: "FORBIDDEN", message: "Pas de compte" });

      // Supprimer uniquement si le cours appartient au profil professeur

      const [deletedCourse] = await db
        .delete(courses)

        .where(and(eq(courses.trainerId, trainer.id), eq(courses.id, input.id)))
        .returning();

      if (deletedCourse.status === "published") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Impossible de supprimer un cours publié",
        });
      }

      if (!deletedCourse) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cours introuvable ou non autorisé",
        });
      }

      return deletedCourse;
    }),

  getCourseDetails: teacherProcedure
    .input(z.object({ id: z.uuid() }))
    .query(async ({ ctx, input }) => {
      const { user } = ctx.auth;

      const warnings = [];

      // Vérifie si le prof existe
      const [trainer] = await db
        .select()
        .from(trainerProfiles)
        .where(eq(trainerProfiles.userId, user.id));

      if (!trainer) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Compte professeur introuvable",
        });
      }

      // Charger le cours + catégories + exigences
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
          thumbnailKey: courses.thumbnailKey,
        })
        .from(courses)
        .where(and(eq(courses.id, input.id), eq(courses.trainerId, trainer.id)))
        .limit(1);

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course introuvable ou non autorisé",
        });
      }

      if (!course.title) warnings.push("title");
      if (!course.description) warnings.push("description");
      if (!course.price || course.price <= 0) warnings.push("price");
      if (!course.level) warnings.push("level");
      if (!course.language) warnings.push("language");

      // Charger les catégories
      const categories = await db
        .select({
          id: courseCategories.id,
          name: courseCategories.name,
          slug: courseCategories.slug,
        })
        .from(courseCategories)
        .innerJoin(
          courseCategoryRelations,
          eq(courseCategoryRelations.categoryId, courseCategories.id)
        )
        .where(eq(courseCategoryRelations.courseId, course.id));

      if (categories.length === 0) warnings.push("category");

      // Charger les exigences
      const requirements = await db
        .select({
          id: courseREquirements.id,
          text: courseREquirements.text,
        })
        .from(courseREquirements)
        .where(eq(courseREquirements.courseId, course.id));

      // Charger les objectifs et audiences
      const objectives = await db
        .select()
        .from(courseLearningObjectives)
        .where(eq(courseLearningObjectives.courseId, course.id));

      if (objectives.length < 4) warnings.push("objectives");

      const audiences = await db
        .select()
        .from(courseTargetAudiences)
        .where(eq(courseTargetAudiences.courseId, course.id));

      if (audiences.length === 0) warnings.push("audience");

      return {
        ...course,
        categories,
        requirements,
        objectives,
        audiences,
        warnings,
        isComplete: warnings.length === 0,
      };
    }),
  // Mettre à jour les détails du cours
  updateCourseSettings: teacherProcedure
    .input(
      z.object({
        id: z.uuid(),
        level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        language: z.enum(["fr", "mg", "en"]).optional(),
        categoryId: z.uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [trainer] = await db
        .select()
        .from(trainerProfiles)
        .where(eq(trainerProfiles.userId, ctx.auth.user.id));

      if (!trainer) throw new TRPCError({ code: "FORBIDDEN" });

      const [course] = await db
        .select()
        .from(courses)
        .where(
          and(eq(courses.id, input.id), eq(courses.trainerId, trainer.id))
        );

      if (!course) throw new TRPCError({ code: "NOT_FOUND" });

      if (input.level || input.language) {
        await db
          .update(courses)
          .set({
            level: input.level ?? course.level,
            language: input.language ?? course.language,
            updatedAt: new Date(),
          })
          .where(eq(courses.id, course.id));
      }

      if (input.categoryId) {
        await db
          .delete(courseCategoryRelations)
          .where(eq(courseCategoryRelations.courseId, course.id));

        await db.insert(courseCategoryRelations).values({
          courseId: course.id,
          categoryId: input.categoryId,
        });
      }

      return { success: true };
    }),
  updateCourseCategory: teacherProcedure
    .input(z.object({ courseId: z.uuid(), categoryId: z.uuid() }))
    .mutation(async ({ ctx, input }) => {}),

  // mutation simple pour l'édition libre
  updateCourseBasics: teacherProcedure
    .input(
      z.object({
        id: z.uuid(),
        title: z.string().min(5),
        description: z.string().min(20),
        price: z.number().min(0),
        level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        language: z.enum(["fr", "mg", "en"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [trainer] = await db
        .select()
        .from(trainerProfiles)
        .where(eq(trainerProfiles.userId, ctx.auth.user.id));

      if (!trainer)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Pas de permission",
        });

      await db
        .update(courses)
        .set({
          title: input.title,
          description: input.description,
          price: input.price,
          level: input.level,
          language: input.language,

          updatedAt: new Date(),
        })
        .where(
          and(eq(courses.id, input.id), eq(courses.trainerId, trainer.id))
        );

      return { success: true };
    }),

  // Ajouter une exigence
  addCourseRequirement: teacherProcedure
    .input(z.object({ courseId: z.uuid(), text: z.string().min(5) }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.auth;
      const [trainer] = await db
        .select()
        .from(trainerProfiles)
        .where(eq(trainerProfiles.userId, user.id));
      if (!trainer)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Pas de compte professeur",
        });

      const [course] = await db
        .select()
        .from(courses)
        .where(
          and(eq(courses.id, input.courseId), eq(courses.trainerId, trainer.id))
        );
      if (!course)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cours introuvable",
        });

      const [requirement] = await db
        .insert(courseREquirements)
        .values({
          courseId: course.id,
          text: input.text,
        })
        .returning();

      return requirement;
    }),
  // Supprimer une exigence
  deleteCourseRequirement: teacherProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.auth;
      const [trainer] = await db
        .select()
        .from(trainerProfiles)
        .where(eq(trainerProfiles.userId, user.id));
      if (!trainer)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Pas de compte professeur",
        });

      await db
        .delete(courseREquirements)
        .where(eq(courseREquirements.id, input.id));

      return { success: true };
    }),

  // Charger toutes les catégories pour select
  getAllCategories: teacherProcedure.query(async () => {
    const categories = await db.select().from(courseCategories);
    return categories;
  }),
  addCourseObjective: teacherProcedure
    .input(
      z.object({
        courseId: z.uuid(),
        text: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.auth;
      // Vérifier que le prof existe
      const [trainer] = await db
        .select()
        .from(trainerProfiles)
        .where(eq(trainerProfiles.userId, user.id));
      if (!trainer) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Pas de compte professeur",
        });
      }
      // Vérifier que le cours appartient au prof
      const [course] = await db
        .select()
        .from(courses)
        .where(
          and(eq(courses.id, input.courseId), eq(courses.trainerId, trainer.id))
        );
      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cours introuvable",
        });
      }
      const [objective] = await db
        .insert(courseLearningObjectives)
        .values({
          courseId: course.id,
          text: input.text,
        })
        .returning();
      return objective;
    }),

  deleteCourseObjective: teacherProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.auth;
      const [trainer] = await db
        .select()
        .from(trainerProfiles)
        .where(eq(trainerProfiles.userId, user.id));
      if (!trainer)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Pas de compte professeur",
        });

      // Vérifier que l'objectif appartient bien au prof
      const [objective] = await db
        .select()
        .from(courseLearningObjectives)
        .where(eq(courseLearningObjectives.id, input.id));
      if (!objective)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Objectif introuvable",
        });

      // Vérifier cours propriétaire
      const [course] = await db
        .select()
        .from(courses)
        .where(
          and(
            eq(courses.id, objective.courseId),
            eq(courses.trainerId, trainer.id)
          )
        );
      if (!course)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });

      await db
        .delete(courseLearningObjectives)
        .where(eq(courseLearningObjectives.id, input.id));
      return { success: true };
    }),

  // ==========================
  // Public cible
  // ==========================
  addCourseAudience: teacherProcedure
    .input(
      z.object({
        courseId: z.uuid(),
        text: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.auth;
      const [trainer] = await db
        .select()
        .from(trainerProfiles)
        .where(eq(trainerProfiles.userId, user.id));
      if (!trainer)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Pas de compte professeur",
        });

      const [course] = await db
        .select()
        .from(courses)
        .where(
          and(eq(courses.id, input.courseId), eq(courses.trainerId, trainer.id))
        );
      if (!course)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cours introuvable",
        });

      const [audience] = await db
        .insert(courseTargetAudiences)
        .values({
          courseId: course.id,
          text: input.text,
        })
        .returning();
      return audience;
    }),

  deleteCourseAudience: teacherProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.auth;
      const [trainer] = await db
        .select()
        .from(trainerProfiles)
        .where(eq(trainerProfiles.userId, user.id));
      if (!trainer)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Pas de compte professeur",
        });

      const [audience] = await db
        .select()
        .from(courseTargetAudiences)
        .where(eq(courseTargetAudiences.id, input.id));
      if (!audience)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Public cible introuvable",
        });

      const [course] = await db
        .select()
        .from(courses)
        .where(
          and(
            eq(courses.id, audience.courseId),
            eq(courses.trainerId, trainer.id)
          )
        );
      if (!course)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });

      await db
        .delete(courseTargetAudiences)
        .where(eq(courseTargetAudiences.id, input.id));
      return { success: true };
    }),
  updateThumbnail: teacherProcedure
    .input(
      z.object({
        courseId: z.uuid(),
        thumbnailUrl: z.url(),
        thumbnailKey: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { courseId, thumbnailUrl, thumbnailKey } = input;
      // Vérifier que le cours appartient au prof
      const [course] = await db
        .select()
        .from(courses)
        .where(
          and(eq(courses.id, courseId), eq(courses.trainerId, ctx.trainer.id))
        );

      if (!course) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Course not found",
        });
      }

      if (course.thumbnailKey) {
        try {
          // Importez UTApi

          const utapi = new UTApi();
          await utapi.deleteFiles(course.thumbnailKey);

          console.log(`🗑️ Ancienne image supprimée: ${course.thumbnailKey}`);
        } catch (error) {
          console.error(
            "Erreur lors de la suppression de l'ancienne image:",
            error
          );
          // Ne pas throw, on continue quand même
        }
      }

      await db
        .update(courses)
        .set({
          thumbnailUrl: thumbnailUrl,
          thumbnailKey: thumbnailKey,
          updatedAt: new Date(),
        })
        .where(eq(courses.id, courseId));

      return {
        success: true,
        message: "Image mise à jour avec succès",
        deletedOldImage: !!course.thumbnailKey,
      };
    }),
  // 1. Récupérer les attachments d'un cours
  getCourseAttachments: teacherProcedure
    .input(z.object({ courseId: z.uuid() }))
    .query(async ({ input, ctx }) => {
      const { courseId } = input;

      // Vérifier les permissions

      const [course] = await db
        .select()
        .from(courses)
        .where(
          and(eq(courses.id, courseId), eq(courses.trainerId, ctx.trainer.id))
        );

      if (!course) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Course not found",
        });
      }

      // Récupérer les attachments
      const attachments = await db
        .select()
        .from(courseAttachments)
        .where(eq(courseAttachments.courseId, courseId))
        .orderBy(desc(courseAttachments.createdAt));

      return attachments;
    }),

  // 2. Supprimer un attachment
  deleteCourseAttachment: teacherProcedure
    .input(
      z.object({
        attachmentId: z.uuid(),
        courseId: z.uuid(), // Pour vérifier les permissions
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { attachmentId, courseId } = input;
      const [course] = await db
        .select()
        .from(courses)
        .where(
          and(eq(courses.id, courseId), eq(courses.trainerId, ctx.trainer.id))
        );

      if (!course) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Course not found",
        });
      }

      // Récupérer l'attachment pour avoir la clé
      // const attachment = await db.query.courseAttachments.findFirst({
      //   where: eq(courseAttachments.id, attachmentId),
      // });
      const [attachment] = await db
        .select()
        .from(courseAttachments)
        .where(eq(courseAttachments.id, attachmentId));

      if (!attachment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pièce jointe non trouvée",
        });
      }

      // Supprimer le fichier d'UploadThing
      if (attachment.attachmentKey) {
        try {
          const utapi = new UTApi();
          await utapi.deleteFiles(attachment.attachmentKey);
        } catch (error) {
          console.error("Erreur suppression fichier:", error);
          // Continuer quand même pour supprimer de la DB
        }
      }

      // Supprimer de la base de données
      await db
        .delete(courseAttachments)
        .where(eq(courseAttachments.id, attachmentId));

      return {
        success: true,
        message: "Pièce jointe supprimée avec succès",
      };
    }),

  // 3. Mettre à jour le nom d'un attachment
  updateAttachmentName: teacherProcedure
    .input(
      z.object({
        attachmentId: z.uuid(),
        courseId: z.uuid(),
        name: z.string().min(1, "Le nom est requis"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { attachmentId, courseId, name } = input;
      const [course] = await db
        .select()
        .from(courses)
        .where(
          and(eq(courses.id, courseId), eq(courses.trainerId, ctx.trainer.id))
        );

      if (!course) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Course not found",
        });
      }

      // Mettre à jour le nom
      await db
        .update(courseAttachments)
        .set({
          name,
          updatedAt: new Date(),
        })
        .where(eq(courseAttachments.id, attachmentId));

      return {
        success: true,
        message: "Nom mis à jour avec succès",
      };
    }),
  createLessonUpload: teacherProcedure
    .input(
      z.object({
        sectionId: z.uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.auth.user;

      // 1️⃣ Vérifier que l'utilisateur est bien un formateur
      const [trainer] = await db
        .select()
        .from(trainerProfiles)
        .where(eq(trainerProfiles.userId, userId));

      if (!trainer) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Pas de compte professeur",
        });
      }

      // 2️⃣ Récupérer section + courseId
      const [section] = await db
        .select({
          sectionId: courseSections.id,
          courseId: courseSections.courseId,
          trainerId: courses.trainerId,
        })
        .from(courseSections)
        .innerJoin(courses, eq(courses.id, courseSections.courseId))
        .where(eq(courseSections.id, input.sectionId));

      if (!section || section.trainerId !== trainer.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const courseId = section.courseId;

      // 3️⃣ CALCULER LA DERNIÈRE POSITION DANS LA SECTION
      const [lastLesson] = await db
        .select({ position: courseLessons.position })
        .from(courseLessons)
        .where(eq(courseLessons.sectionId, input.sectionId))
        .orderBy(desc(courseLessons.position))
        .limit(1);

      const position = lastLesson ? lastLesson.position + 1 : 1;

      // 4️⃣ Créer l'upload Mux
      const upload = await mux.video.uploads.create({
        new_asset_settings: {
          passthrough: userId,
          playback_policies: ["public"],
          input: [
            {
              generated_subtitles: [
                {
                  language_code: "fr",
                  name: "Malagasy",
                },
              ],
            },
          ],
        },
        cors_origin: "*",
      });

      // 5️⃣ Créer la lesson en DB avec la position calculée
      const [lesson] = await db
        .insert(courseLessons)
        .values({
          sectionId: section.sectionId,
          title: "Untitled lesson",
          // ou "Leçon sans titre",
          description: "No description",
          muxStatus: "waiting", // ou "pending"
          muxUploadId: upload.id,
          visibility: "paid", // ou "draft" selon votre logique
          isPublished: false,
          position: position, // ← Position calculée automatiquement

          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // 6️⃣ Retour EXACT attendu par le frontend
      return {
        lesson,
        url: upload.url,
        courseId,
      };
    }),
  getAllLessonByCourseId: teacherProcedure
    .input(
      z.object({
        courseId: z.uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.auth.user;

      // 1️⃣ Vérifier formateur
      const [trainer] = await db
        .select()
        .from(trainerProfiles)
        .where(eq(trainerProfiles.userId, userId));

      if (!trainer) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // 2️⃣ Vérifier que le cours lui appartient
      const [course] = await db
        .select()
        .from(courses)
        .where(
          and(eq(courses.id, input.courseId), eq(courses.trainerId, trainer.id))
        );

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cours introuvable",
        });
      }

      // 3️⃣ Récupérer sections + lessons
      const sections = await db
        .select({
          id: courseSections.id,
          title: courseSections.title,
          position: courseSections.position,
          // CORRECTION ICI : Utilisez COALESCE pour éviter les éléments null
          // todos: add   -- 'type', ${courseLessons.type}, later
          lessons: sql<any>`COALESCE(
        json_agg(
          json_build_object(
            'id', ${courseLessons.id},
            'title', ${courseLessons.title},

            'description', ${courseLessons.description},
            'position', ${courseLessons.position},
            'muxStatus', ${courseLessons.muxStatus},
            'muxPlaybackId', ${courseLessons.muxPlaybackId},
            'duration', ${courseLessons.duration},
            'visibility', ${courseLessons.visibility},
          
            'isPublished', ${courseLessons.isPublished},
            'thumbnailUrl', ${courseLessons.thumbnailUrl},
            'createdAt', ${courseLessons.createdAt}
          )
          ORDER BY ${courseLessons.position}
        ) FILTER (WHERE ${courseLessons.id} IS NOT NULL),
        '[]'::json
      )`,
        })
        .from(courseSections)
        .leftJoin(courseLessons, eq(courseLessons.sectionId, courseSections.id))
        .where(eq(courseSections.courseId, input.courseId))
        .groupBy(
          courseSections.id,
          courseSections.title,
          courseSections.position
        )
        .orderBy(courseSections.position);

      // Un log pour me debugger
      console.log("Section avec durée : ", JSON.stringify(sections, null, 2));

      return sections;
    }),
  createSection: teacherProcedure
    .input(
      z.object({
        courseId: z.uuid(),
        title: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.auth.user;
      const { courseId, title } = input;

      // 1️⃣ Vérifier que l'utilisateur est bien un formateur
      const [trainer] = await db
        .select()
        .from(trainerProfiles)
        .where(eq(trainerProfiles.userId, userId));

      if (!trainer) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Pas de compte professeur",
        });
      }

      // 2️⃣ Vérifier que le cours existe et lui appartient
      const [course] = await db
        .select()
        .from(courses)
        .where(
          and(eq(courses.id, courseId), eq(courses.trainerId, trainer.id))
        );

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cours introuvable ou accès interdit",
        });
      }

      // 3️⃣ Calculer la position (dernier + 1)
      const [lastSection] = await db
        .select({ position: courseSections.position })
        .from(courseSections)
        .where(eq(courseSections.courseId, courseId))
        .orderBy(desc(courseSections.position))
        .limit(1);

      const position = lastSection ? lastSection.position + 1 : 1;

      // 4️⃣ Créer la section
      const [section] = await db
        .insert(courseSections)
        .values({
          courseId,
          title,
          position,
        })
        .returning();

      return {
        section,
      };
    }),
  deleteSection: teacherProcedure
    .input(
      z.object({
        sectionId: z.uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.auth.user;
      const { sectionId } = input;

      // Vérifier le formateur
      const [trainer] = await db
        .select()
        .from(trainerProfiles)
        .where(eq(trainerProfiles.userId, userId));

      if (!trainer) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Pas de compte professeur",
        });
      }

      // Vérifier que la section appartient au formateur
      const [section] = await db
        .select({
          sectionId: courseSections.id,
          courseId: courseSections.courseId,
          position: courseSections.position,
        })
        .from(courseSections)
        .innerJoin(courses, eq(courses.id, courseSections.courseId))
        .where(
          and(
            eq(courseSections.id, sectionId),
            eq(courses.trainerId, trainer.id)
          )
        )
        .limit(1);

      if (!section) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Section introuvable ou accès interdit",
        });
      }

      // 1️⃣ Supprimer toutes les leçons associées
      await db
        .delete(courseLessons)
        .where(eq(courseLessons.sectionId, sectionId));

      // 2️⃣ Supprimer la section
      await db.delete(courseSections).where(eq(courseSections.id, sectionId));

      // 3️⃣ Réindexer les positions des sections restantes
      const remainingSections = await db
        .select({ id: courseSections.id })
        .from(courseSections)
        .where(eq(courseSections.courseId, section.courseId))
        .orderBy(courseSections.position);

      for (let i = 0; i < remainingSections.length; i++) {
        await db
          .update(courseSections)
          .set({ position: i + 1 })
          .where(eq(courseSections.id, remainingSections[i].id));
      }

      return {
        success: true,
        message: "Section supprimée avec succès",
      };
    }),
  updateSection: teacherProcedure
    .input(
      z.object({
        sectionId: z.uuid(),
        title: z.string().min(1, "Le titre ne peut pas être vide"),
        description: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.auth.user;
      const { sectionId, title, description } = input;

      // 1️⃣ Vérifier que l'utilisateur est bien un formateur
      const [trainer] = await db
        .select()
        .from(trainerProfiles)
        .where(eq(trainerProfiles.userId, userId));

      if (!trainer) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Pas de compte professeur",
        });
      }

      // 2️⃣ Vérifier que la section existe et lui appartient
      const [section] = await db
        .select({
          id: courseSections.id,
        })
        .from(courseSections)
        .innerJoin(courses, eq(courses.id, courseSections.courseId))
        .where(
          and(
            eq(courseSections.id, sectionId),
            eq(courses.trainerId, trainer.id)
          )
        )
        .limit(1);

      if (!section) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Section introuvable ou accès interdit",
        });
      }

      // 3️⃣ Mettre à jour la section
      const [updatedSection] = await db
        .update(courseSections)
        .set({
          title,
          updatedAt: new Date(),
        })
        .where(eq(courseSections.id, sectionId))
        .returning();

      return {
        success: true,
        section: updatedSection,
        message: "Section mise à jour avec succès",
      };
    }),
  updateSectionPosition: teacherProcedure
    .input(
      z.object({
        sectionId: z.uuid(),
        newPosition: z.number().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.auth.user;
      const { sectionId, newPosition } = input;

      // 1️⃣ Vérifier que l'utilisateur est bien un formateur
      const [trainer] = await db
        .select()
        .from(trainerProfiles)
        .where(eq(trainerProfiles.userId, userId));

      if (!trainer) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Pas de compte professeur",
        });
      }

      // 2️⃣ Vérifier que la section existe et appartient au formateur
      const [section] = await db
        .select({
          id: courseSections.id,
          currentPosition: courseSections.position,
          courseId: courseSections.courseId,
        })
        .from(courseSections)
        .innerJoin(courses, eq(courses.id, courseSections.courseId))
        .where(
          and(
            eq(courseSections.id, sectionId),
            eq(courses.trainerId, trainer.id)
          )
        )
        .limit(1);

      if (!section) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Section introuvable ou accès interdit",
        });
      }

      // 3️⃣ Mettre à jour la position de la section
      await db
        .update(courseSections)
        .set({
          position: newPosition,
          updatedAt: new Date(),
        })
        .where(eq(courseSections.id, sectionId));

      // 4️⃣ Réorganiser toutes les sections du cours
      const allSections = await db
        .select({
          id: courseSections.id,
          position: courseSections.position,
        })
        .from(courseSections)
        .where(eq(courseSections.courseId, section.courseId))
        .orderBy(courseSections.position);

      // Réindexer pour avoir des positions continues 1, 2, 3...
      let positionCounter = 1;
      for (const s of allSections) {
        await db
          .update(courseSections)
          .set({ position: positionCounter })
          .where(eq(courseSections.id, s.id));
        positionCounter++;
      }

      return {
        success: true,
        message: "Position de la section mise à jour",
      };
    }),
  updateLessonPosition: teacherProcedure
    .input(
      z.object({
        lessonId: z.uuid(),
        newPosition: z.number(),
        sectionId: z.uuid().optional(), // Pour changer de section
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.auth.user;
      const { lessonId, newPosition, sectionId } = input;

      // Vérifier le formateur
      const [trainer] = await db
        .select()
        .from(trainerProfiles)
        .where(eq(trainerProfiles.userId, userId));

      if (!trainer) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Pas de compte professeur",
        });
      }

      // Vérifier que la leçon appartient au formateur
      const [lesson] = await db
        .select({
          id: courseLessons.id,
          currentPosition: courseLessons.position,
          currentSectionId: courseLessons.sectionId,
        })
        .from(courseLessons)
        .innerJoin(
          courseSections,
          eq(courseSections.id, courseLessons.sectionId)
        )
        .innerJoin(courses, eq(courses.id, courseSections.courseId))
        .where(
          and(eq(courseLessons.id, lessonId), eq(courses.trainerId, trainer.id))
        )
        .limit(1);

      if (!lesson) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Leçon introuvable ou accès interdit",
        });
      }

      // Préparer les mises à jour
      const updates: any = {
        position: newPosition,
        updatedAt: new Date(),
      };

      // Si on change de section
      if (sectionId && sectionId !== lesson.currentSectionId) {
        // Vérifier que la nouvelle section appartient au même cours
        const [newSection] = await db
          .select()
          .from(courseSections)
          .innerJoin(courses, eq(courses.id, courseSections.courseId))
          .where(
            and(
              eq(courseSections.id, sectionId),
              eq(courses.trainerId, trainer.id)
            )
          )
          .limit(1);

        if (!newSection) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Section introuvable ou accès interdit",
          });
        }

        updates.sectionId = sectionId;
      }

      // Mettre à jour la leçon
      await db
        .update(courseLessons)
        .set(updates)
        .where(eq(courseLessons.id, lessonId));

      // Réorganiser les autres leçons dans l'ancienne section si nécessaire
      if (!sectionId || sectionId === lesson.currentSectionId) {
        // Décaler les positions dans la même section
        const lessonsToUpdate = await db
          .select({ id: courseLessons.id, position: courseLessons.position })
          .from(courseLessons)
          .where(eq(courseLessons.sectionId, lesson.currentSectionId))
          .orderBy(courseLessons.position);

        // Réindexer toutes les leçons
        let positionCounter = 1;
        for (const l of lessonsToUpdate) {
          if (l.id !== lessonId) {
            if (positionCounter === newPosition) {
              positionCounter++; // Skip the position we're moving to
            }
            await db
              .update(courseLessons)
              .set({ position: positionCounter })
              .where(eq(courseLessons.id, l.id));
            positionCounter++;
          }
        }
      } else {
        // Si changement de section, réorganiser les deux sections
        await reorderSectionLessons(lesson.currentSectionId);
        await reorderSectionLessons(sectionId!);
      }

      return {
        success: true,
        message: "Position mise à jour avec succès",
      };
    }),

  getLesson: teacherProcedure
    .input(
      z.object({
        lessonId: z.uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.auth.user;

      // 1️⃣ Vérifier formateur
      const [trainer] = await db
        .select()
        .from(trainerProfiles)
        .where(eq(trainerProfiles.userId, userId));

      if (!trainer) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // 2️⃣ Récupérer la lesson + vérifier ownership
      const [lesson] = await db
        .select({
          id: courseLessons.id,
          title: courseLessons.title,
          description: courseLessons.description,
          visibility: courseLessons.visibility,
          muxPlaybackId: courseLessons.muxPlaybackId,
          sectionId: courseLessons.sectionId,
          thumbnailUrl: courseLessons.thumbnailUrl,
          thumbnailKey: courseLessons.thumbnailKey,
          duration: courseLessons.duration,
          isPublished: courseLessons.isPublished,
          position: courseLessons.position,
          createdAt: courseLessons.createdAt,
          updatedAt: courseLessons.updatedAt,
          muxStatus: courseLessons.muxStatus,
          muxAssetId: courseLessons.muxAssetId,
          muxUploadId: courseLessons.muxUploadId,
          muxTrackId: courseLessons.muxTrackId,
          muxTrackStatus: courseLessons.muxTrackStatus,
        })
        .from(courseLessons)
        .innerJoin(
          courseSections,
          eq(courseLessons.sectionId, courseSections.id)
        )
        .innerJoin(courses, eq(courseSections.courseId, courses.id))
        .where(
          and(
            eq(courseLessons.id, input.lessonId),
            eq(courses.trainerId, trainer.id)
          )
        );

      if (!lesson) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lesson introuvable",
        });
      }

      return lesson;
    }),

  updateLesson: teacherProcedure
    .input(lessonUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.auth.user;

      // 1️⃣ Vérifier formateur
      const [trainer] = await db
        .select()
        .from(trainerProfiles)
        .where(eq(trainerProfiles.userId, userId));

      if (!trainer) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // 2️⃣ Vérifier ownership de la lesson
      const [lesson] = await db
        .select({ id: courseLessons.id })
        .from(courseLessons)
        .innerJoin(
          courseSections,
          eq(courseLessons.sectionId, courseSections.id)
        )
        .innerJoin(courses, eq(courseSections.courseId, courses.id))
        .where(
          and(eq(courseLessons.id, input.id), eq(courses.trainerId, trainer.id))
        );

      if (!lesson) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lesson introuvable ou accès interdit",
        });
      }

      // 3️⃣ Préparer les données de mise à jour
      const updateData: any = {
        title: input.title,
        description: input.description,
        visibility: input.visibility,
        updatedAt: new Date(), // Toujours mettre à jour la date
      };

      // 4️⃣ Ajouter isPublished seulement s'il est fourni
      if (typeof input.isPublished === "boolean") {
        updateData.isPublished = input.isPublished;
      }

      // 5️⃣ Vérifications supplémentaires si on publie la leçon
      if (input.isPublished === true) {
        // Vérifier que la vidéo est prête
        const [lessonDetails] = await db
          .select({
            muxStatus: courseLessons.muxStatus,
            title: courseLessons.title,
            description: courseLessons.description,
          })
          .from(courseLessons)
          .where(eq(courseLessons.id, input.id));

        if (!lessonDetails) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Leçon introuvable",
          });
        }

        // Vérifier les prérequis pour la publication
        const errors: string[] = [];

        if (!lessonDetails.title || lessonDetails.title.length < 5) {
          errors.push("Le titre doit avoir au moins 5 caractères");
        }

        if (lessonDetails.muxStatus !== "ready") {
          errors.push("La vidéo doit être prête (statut: ready)");
        }

        if (
          !lessonDetails.description ||
          lessonDetails.description.length < 5
        ) {
          errors.push("La description doit avoir au moins 20 caractères");
        }

        if (errors.length > 0) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: `Prérequis manquants : ${errors.join(", ")}`,
          });
        }
      }

      // 6️⃣ Mettre à jour la leçon
      const [updatedLesson] = await db
        .update(courseLessons)
        .set(updateData)
        .where(eq(courseLessons.id, input.id))
        .returning();

      return updatedLesson;
    }),

  deleteLesson: teacherProcedure
    .input(
      z.object({
        lessonId: z.uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.auth.user;

      // 1️⃣ Vérifier formateur
      const [trainer] = await db
        .select()
        .from(trainerProfiles)
        .where(eq(trainerProfiles.userId, userId));

      if (!trainer) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // 2️⃣ Vérifier ownership
      const [lesson] = await db
        .select({ id: courseLessons.id })
        .from(courseLessons)
        .innerJoin(
          courseSections,
          eq(courseLessons.sectionId, courseSections.id)
        )
        .innerJoin(courses, eq(courseSections.courseId, courses.id))
        .where(
          and(
            eq(courseLessons.id, input.lessonId),
            eq(courses.trainerId, trainer.id)
          )
        );

      if (!lesson) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lesson introuvable ou accès interdit",
        });
      }

      // 3️⃣ Suppression
      await db
        .delete(courseLessons)
        .where(eq(courseLessons.id, input.lessonId));

      return { success: true };
    }),
  // 1. Récupérer les attachments d'une leçon
  getLessonAttachments: teacherProcedure
    .input(
      z.object({
        lessonId: z.uuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { lessonId } = input;

      // Vérifier les permissions - le formateur possède-t-il cette leçon ?
      const [lesson] = await db
        .select({
          id: courseLessons.id,
        })
        .from(courseLessons)
        .innerJoin(
          courseSections,
          eq(courseSections.id, courseLessons.sectionId)
        )
        .innerJoin(courses, eq(courses.id, courseSections.courseId))
        .innerJoin(trainerProfiles, eq(trainerProfiles.id, courses.trainerId))
        .where(
          and(
            eq(courseLessons.id, lessonId),
            eq(trainerProfiles.userId, ctx.auth.user.id)
          )
        );

      if (!lesson) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Leçon introuvable ou accès non autorisé",
        });
      }

      // Récupérer les attachments
      const attachments = await db
        .select()
        .from(lessonAttachments)
        .where(eq(lessonAttachments.lessonId, lessonId))
        .orderBy(desc(lessonAttachments.createdAt));

      return attachments;
    }),
  // 2. Créer un nouvel attachment (sera appelé par UploadThing)
  createLessonAttachment: teacherProcedure
    .input(
      z.object({
        lessonId: z.uuid(),
        name: z.string().min(1, "Le nom est requis"),
        attachmentUrl: z.string().url("URL invalide"),
        attachmentKey: z.string().min(1, "Clé UploadThing requise"),
        type: z.string().min(1, "Type de fichier requis"),
        size: z.number().min(0, "Taille invalide"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { lessonId, name, attachmentUrl, attachmentKey, type, size } =
        input;

      // Vérifier les permissions
      const [lesson] = await db
        .select({
          id: courseLessons.id,
        })
        .from(courseLessons)
        .innerJoin(
          courseSections,
          eq(courseSections.id, courseLessons.sectionId)
        )
        .innerJoin(courses, eq(courses.id, courseSections.courseId))
        .innerJoin(trainerProfiles, eq(trainerProfiles.id, courses.trainerId))
        .where(
          and(
            eq(courseLessons.id, lessonId),
            eq(trainerProfiles.userId, ctx.auth.user.id)
          )
        );

      if (!lesson) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Leçon introuvable ou accès non autorisé",
        });
      }

      // Créer l'attachment
      const [attachment] = await db
        .insert(lessonAttachments)
        .values({
          lessonId,
          name,
          attachmentUrl,
          attachmentKey,
          type,
          size,
        })
        .returning();

      return {
        success: true,
        attachment,
        message: "Pièce jointe ajoutée avec succès",
      };
    }),
  // 4. Supprimer un attachment
  deleteLessonAttachment: teacherProcedure
    .input(
      z.object({
        attachmentId: z.uuid(),
        lessonId: z.uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { attachmentId, lessonId } = input;

      // Vérifier les permissions et récupérer l'attachment avec sa clé
      const [attachment] = await db
        .select({
          id: lessonAttachments.id,
          attachmentKey: lessonAttachments.attachmentKey,
          name: lessonAttachments.name,
        })
        .from(lessonAttachments)
        .innerJoin(
          courseLessons,
          eq(courseLessons.id, lessonAttachments.lessonId)
        )
        .innerJoin(
          courseSections,
          eq(courseSections.id, courseLessons.sectionId)
        )
        .innerJoin(courses, eq(courses.id, courseSections.courseId))
        .innerJoin(trainerProfiles, eq(trainerProfiles.id, courses.trainerId))
        .where(
          and(
            eq(lessonAttachments.id, attachmentId),
            eq(lessonAttachments.lessonId, lessonId),
            eq(trainerProfiles.userId, ctx.auth.user.id)
          )
        )
        .limit(1);

      if (!attachment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pièce jointe introuvable ou accès non autorisé",
        });
      }

      // Supprimer le fichier d'UploadThing
      if (attachment.attachmentKey) {
        try {
          const utapi = new UTApi();
          await utapi.deleteFiles(attachment.attachmentKey);
        } catch (error) {
          console.error(
            "Erreur lors de la suppression sur UploadThing:",
            error
          );
          // Continuer quand même pour supprimer de la DB
        }
      }

      // Supprimer de la base de données
      await db
        .delete(lessonAttachments)
        .where(eq(lessonAttachments.id, attachmentId));

      return {
        success: true,
        message: `"${attachment.name}" supprimé avec succès`,
      };
    }),
  // Ajoutez cette procédure dans votre teacherRouter, par exemple après deleteLessonAttachment
  updateLessonAttachmentName: teacherProcedure
    .input(
      z.object({
        attachmentId: z.uuid(),
        lessonId: z.uuid(),
        name: z
          .string()
          .min(1, "Le nom est requis")
          .max(200, "Le nom est trop long"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { attachmentId, lessonId, name } = input;

      // 1. Vérifier les permissions et que l'attachment appartient à la leçon
      const [attachment] = await db
        .select({
          id: lessonAttachments.id,
          currentName: lessonAttachments.name,
        })
        .from(lessonAttachments)
        .innerJoin(
          courseLessons,
          eq(courseLessons.id, lessonAttachments.lessonId)
        )
        .innerJoin(
          courseSections,
          eq(courseSections.id, courseLessons.sectionId)
        )
        .innerJoin(courses, eq(courses.id, courseSections.courseId))
        .innerJoin(trainerProfiles, eq(trainerProfiles.id, courses.trainerId))
        .where(
          and(
            eq(lessonAttachments.id, attachmentId),
            eq(lessonAttachments.lessonId, lessonId),
            eq(trainerProfiles.userId, ctx.auth.user.id)
          )
        )
        .limit(1);

      if (!attachment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pièce jointe introuvable ou accès non autorisé",
        });
      }

      // 2. Vérifier si le nom a vraiment changé (optionnel, pour éviter des updates inutiles)
      if (attachment.currentName === name) {
        return {
          success: true,
          message: "Le nom est déjà à jour",
          attachment: { ...attachment, name },
        };
      }

      // 3. Mettre à jour le nom
      const [updatedAttachment] = await db
        .update(lessonAttachments)
        .set({
          name,
          updatedAt: new Date(),
        })
        .where(eq(lessonAttachments.id, attachmentId))
        .returning();

      return {
        success: true,
        attachment: updatedAttachment,
        message: "Nom mis à jour avec succès",
      };
    }),
  // Ajoutez cette procédure dans teacherRouter
  publishCourse: teacherProcedure
    .input(
      z.object({
        courseId: z.uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.auth;
      const { courseId } = input;

      // 1. Vérifier que le professeur existe
      const [trainer] = await db
        .select()
        .from(trainerProfiles)
        .where(eq(trainerProfiles.userId, user.id));

      if (!trainer) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Compte professeur introuvable",
        });
      }

      // 2. Charger le cours avec toutes les informations nécessaires
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
          // Ajoutez d'autres champs si nécessaire
        })
        .from(courses)
        .where(and(eq(courses.id, courseId), eq(courses.trainerId, trainer.id)))
        .limit(1);

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cours introuvable ou non autorisé",
        });
      }

      // 3. Vérifier les informations du cours
      const errors: string[] = [];

      // Titre
      if (!course.title || course.title.length < 5) {
        errors.push("Le titre doit avoir au moins 5 caractères");
      }

      // Description
      if (!course.description || course.description.length < 20) {
        errors.push("La description doit avoir au moins 20 caractères");
      }

      // Prix
      if (course.price === undefined || course.price < 0) {
        errors.push("Le prix doit être défini et positif");
      }

      // Niveau
      if (!course.level) {
        errors.push("Le niveau doit être défini");
      }

      // Langue
      if (!course.language) {
        errors.push("La langue doit être définie");
      }

      // Image du cours
      if (!course.thumbnailUrl) {
        errors.push("Une image de couverture est requise");
      }

      // 4. Vérifier les catégories
      const categories = await db
        .select({
          id: courseCategories.id,
        })
        .from(courseCategories)
        .innerJoin(
          courseCategoryRelations,
          eq(courseCategoryRelations.categoryId, courseCategories.id)
        )
        .where(eq(courseCategoryRelations.courseId, courseId));

      if (categories.length === 0) {
        errors.push("Au moins une catégorie est requise");
      }

      // 5. Vérifier les objectifs
      const objectives = await db
        .select()
        .from(courseLearningObjectives)
        .where(eq(courseLearningObjectives.courseId, courseId));

      if (objectives.length === 0) {
        errors.push("Au moins un objectif d'apprentissage est requis");
      }

      // 6. Vérifier le public cible
      const audiences = await db
        .select()
        .from(courseTargetAudiences)
        .where(eq(courseTargetAudiences.courseId, courseId));

      if (audiences.length === 0) {
        errors.push("Au moins un public cible est requis");
      }

      // 7. Vérifier les compétences acquises
      const requirements = await db
        .select()
        .from(courseREquirements)
        .where(eq(courseREquirements.courseId, courseId));

      if (requirements.length === 0) {
        errors.push("Au moins une compétence acquise est requise");
      }

      // 8. Vérifier les sections et leçons
      const sections = await db
        .select({
          id: courseSections.id,
          lessonCount: sql<number>`COUNT(${courseLessons.id})`,
        })
        .from(courseSections)
        .leftJoin(courseLessons, eq(courseLessons.sectionId, courseSections.id))
        .where(eq(courseSections.courseId, courseId))
        .groupBy(courseSections.id);

      if (sections.length < 2) {
        errors.push("Le cours doit comporter au moins 2 sections");
      } else {
        // Vérifier que chaque section a au moins 1 leçon
        const sectionsWithInsufficientLessons = sections.filter(
          (section) => section.lessonCount < 1
        );
        if (sectionsWithInsufficientLessons.length > 0) {
          errors.push("Chaque section doit comporter au moins 1 leçon");
        }
      }

      // 9. Si erreurs, renvoyer les erreurs
      if (errors.length > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Impossible de publier le cours",
          cause: errors,
        });
      }

      // 10. Si tout est valide, publier le cours
      const [updatedCourse] = await db
        .update(courses)
        .set({
          status: "published",
          publishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(courses.id, courseId))
        .returning();

      return {
        success: true,
        course: updatedCourse,
        message: "Cours publié avec succès!",
      };
    }),
  // Ajoutez cette procédure dans teacherRouter après publishCourse
  unpublishCourse: teacherProcedure
    .input(
      z.object({
        courseId: z.uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.auth;
      const { courseId } = input;

      // 1. Vérifier que le professeur existe
      const [trainer] = await db
        .select()
        .from(trainerProfiles)
        .where(eq(trainerProfiles.userId, user.id));

      if (!trainer) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Compte professeur introuvable",
        });
      }

      // 2. Vérifier que le cours existe et appartient au professeur
      const [course] = await db
        .select({
          id: courses.id,
          title: courses.title,
          status: courses.status,
        })
        .from(courses)
        .where(and(eq(courses.id, courseId), eq(courses.trainerId, trainer.id)))
        .limit(1);

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cours introuvable ou non autorisé",
        });
      }

      // 3. Vérifier que le cours est publié
      if (course.status !== "published") {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Le cours n'est pas publié",
        });
      }

      // 4. Dépublier le cours
      const [updatedCourse] = await db
        .update(courses)
        .set({
          status: "draft",
          unpublishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(courses.id, courseId))
        .returning();

      return {
        success: true,
        course: updatedCourse,
        message: "Cours dépublié avec succès",
      };
    }),
});

// Fonction utilitaire de ce procedure
// Fonction utilitaire pour réorganiser une section
async function reorderSectionLessons(sectionId: string) {
  const lessons = await db
    .select({ id: courseLessons.id })
    .from(courseLessons)
    .where(eq(courseLessons.sectionId, sectionId))
    .orderBy(courseLessons.position);

  for (let i = 0; i < lessons.length; i++) {
    await db
      .update(courseLessons)
      .set({ position: i + 1 })
      .where(eq(courseLessons.id, lessons[i].id));
  }
}
