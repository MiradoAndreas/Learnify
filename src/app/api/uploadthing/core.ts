import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import z from "zod";
import { db } from "@/db";
import {
  courseAttachments,
  courseLessons,
  courseSections,
  courses,
  lessonAttachments,
  trainerProfiles,
} from "@/db/schema";
import { auth } from "@/lib/auth";

console.log("📦 uploadthing core.ts LOADED");

console.log("🔑 UPLOADTHING_TOKEN", process.env.UPLOADTHING_TOKEN);

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  avatarUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .input(z.object({ userId: z.string() }))
    .middleware(async ({ input }) => {
      console.log("Middleware passé");
      console.log("On récupere le session ici");
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      console.log("session recupérer");

      if (!session?.user) {
        console.log("Uploadthing error");
        throw new UploadThingError("Unauthorized");
      }

      // Vérifier que l'utilisateur modifie son propre avatar
      if (session.user.id !== input.userId) {
        console.log("Vous pouvez updater votre propre avatar");
        throw new UploadThingError("You can only update your own avatar");
      }

      return { userId: input.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Avatar upload complete:", file);

      // Vous pouvez ici mettre à jour la base de données immédiatement
      // Ou laisser le frontend gérer la mise à jour via une mutation TRPC

      return {
        uploadBy: metadata.userId,
        url: file.ufsUrl,
        key: file.key,
        size: file.size,
      };
    }),

thumbnailUploader: f({
  image: {
    maxFileSize: "4MB",
    maxFileCount: 1,
  },
})
  .input(
    z.object({
      courseId: z.uuid(),
    }),
  )
  .middleware(async ({ input }) => {
    console.log("\n");
    console.log("========================================");
    console.log("🟡 THUMBNAIL MIDDLEWARE START");
    console.log("========================================");

    try {
      console.log("1️⃣ INPUT");
      console.dir(input, { depth: null });

      // -------------------------------
      // AUTH
      // -------------------------------

      console.log("2️⃣ GET SESSION");

      const requestHeaders = await headers();

      console.log("   headers récupérés");

      const session = await auth.api.getSession({
        headers: requestHeaders,
      });

      console.log("   session:", !!session);
      console.log("   user:", session?.user?.id);

      if (!session?.user) {
        console.error("❌ NO SESSION");

        throw new UploadThingError("Unauthorized");
      }

      // -------------------------------
      // TRAINER
      // -------------------------------

      console.log("3️⃣ GET TRAINER");

      const [trainer] = await db
        .select({
          id: trainerProfiles.id,
        })
        .from(trainerProfiles)
        .where(
          eq(
            trainerProfiles.userId,
            session.user.id,
          ),
        )
        .limit(1);

      console.log("   trainer:", trainer);

      if (!trainer) {
        console.error("❌ TRAINER NOT FOUND");

        throw new UploadThingError(
          "Trainer account not found",
        );
      }

      // -------------------------------
      // METADATA
      // -------------------------------

      console.log("4️⃣ CREATE METADATA");

      const metadata = {
        trainer: {
          id: trainer.id,
        },
        courseId: input.courseId,
      };

      console.log("   metadata:");
      console.dir(metadata, { depth: null });

      console.log("5️⃣ RETURN METADATA");

      console.log("========================================");
      console.log("🟢 THUMBNAIL MIDDLEWARE SUCCESS");
      console.log("========================================");

      return metadata;
    } catch (error) {
      console.log("========================================");
      console.error("🔴 THUMBNAIL MIDDLEWARE ERROR");
      console.error("========================================");

      console.error("error:", error);

      if (error instanceof Error) {
        console.error("name:", error.name);
        console.error("message:", error.message);
        console.error("stack:", error.stack);
      }

      console.log("========================================");

      throw error;
    }
  })
  .onUploadComplete(async ({ metadata, file }) => {
    console.log("\n");
    console.log("========================================");
    console.log("🟢 THUMBNAIL UPLOAD COMPLETE");
    console.log("========================================");

    console.log("metadata:");
    console.dir(metadata, { depth: null });

    console.log("file:");
    console.dir(
      {
        key: file.key,
        name: file.name,
        size: file.size,
        type: file.type,
        url: file.ufsUrl,
      },
      { depth: null },
    );

    const result = {
      uploadedBy: metadata.trainer.id,
      url: file.ufsUrl,
      key: file.key,
    };

    console.log("result:");
    console.dir(result, { depth: null });

    console.log("========================================");
    console.log("🟢 THUMBNAIL COMPLETE SUCCESS");
    console.log("========================================");

    return result;
  }),
  // NOUVELLE ROUTE : Course Attachments
  courseAttachmentUploader: f({
    pdf: {
      maxFileSize: "16MB",
      maxFileCount: 10,
    },
    image: {
      maxFileSize: "8MB",
      maxFileCount: 10,
    },

    blob: {
      maxFileSize: "64MB", // ZIP, DOCX, PPTX, etc.
      maxFileCount: 10,
    },
    text: {
      maxFileSize: "2MB",
      maxFileCount: 10,
    },
  })
    .input(
      z.object({
        courseId: z.uuid(),
        name: z.string().optional(), // Nom personnalisé (optionnel)
      }),
    )
    .middleware(async ({ input }) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session?.user) throw new UploadThingError("Unauthorized");

      const [trainer] = await db
        .select({ id: trainerProfiles.id })
        .from(trainerProfiles)
        .where(eq(trainerProfiles.userId, session.user.id))
        .limit(1);

      if (!trainer) throw new UploadThingError("Trainer account not found");

      // Vérifier que le cours appartient au trainer
      const course = await db
        .select({ id: courses.id })
        .from(courses)
        .where(
          and(
            eq(courses.id, input.courseId),
            eq(courses.trainerId, trainer.id),
          ),
        )
        .limit(1);

      if (!course.length) {
        throw new UploadThingError("Course not found or access denied");
      }

      return { trainer, ...input };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("📎 Course attachment upload complete:", file);

      // Déterminer le type de fichier
      const fileType = getFileType(file.type);

      // Insérer dans la base de données
      const [attachment] = await db
        .insert(courseAttachments)
        .values({
          courseId: metadata.courseId,
          name: metadata.name || file.name,
          attachmentUrl: file.ufsUrl,
          attachmentKey: file.key,
          type: fileType,
          size: file.size,
        })
        .returning();

      console.log("✅ Attachment saved to DB:", attachment);

      return {
        uploadedBy: metadata.trainer.id,
        attachmentId: attachment.id,
        url: file.ufsUrl,
        key: file.key,
        name: attachment.name,
        type: fileType,
        size: file.size,
      };
    }),
  lessonAttachmentUploader: f({
    pdf: {
      maxFileSize: "16MB",
      maxFileCount: 10,
    },
    image: {
      maxFileSize: "8MB",
      maxFileCount: 10,
    },
    blob: {
      maxFileSize: "64MB", // ZIP, DOCX, PPTX, etc.
      maxFileCount: 10,
    },
    text: {
      maxFileSize: "2MB",
      maxFileCount: 10,
    },
  })
    .input(
      z.object({
        lessonId: z.uuid(),
        name: z.string().optional(), // Nom personnalisé (optionnel)
      }),
    )
    .middleware(async ({ input }) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session?.user) throw new UploadThingError("Unauthorized");

      const [trainer] = await db
        .select({ id: trainerProfiles.id })
        .from(trainerProfiles)
        .where(eq(trainerProfiles.userId, session.user.id))
        .limit(1);

      if (!trainer) throw new UploadThingError("Trainer account not found");

      // Vérifier que la leçon appartient au trainer
      const [lesson] = await db
        .select({ id: courseLessons.id })
        .from(courseLessons)
        .innerJoin(
          courseSections,
          eq(courseSections.id, courseLessons.sectionId),
        )
        .innerJoin(courses, eq(courses.id, courseSections.courseId))
        .where(
          and(
            eq(courseLessons.id, input.lessonId),
            eq(courses.trainerId, trainer.id),
          ),
        )
        .limit(1);

      if (!lesson) {
        throw new UploadThingError("Lesson not found or access denied");
      }

      return { trainer, ...input };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("📎 Lesson attachment upload complete:", file);

      // Déterminer le type de fichier
      const fileType = getFileType(file.type);

      try {
        // Insérer dans la base de données
        const [attachment] = await db
          .insert(lessonAttachments)
          .values({
            lessonId: metadata.lessonId,
            name: metadata.name || file.name,
            attachmentUrl: file.ufsUrl,
            attachmentKey: file.key,
            type: fileType,
            size: file.size,
          })
          .returning();

        console.log("✅ Lesson attachment saved to DB:", attachment);

        return {
          uploadedBy: metadata.trainer.id,
          attachmentId: attachment.id,
          url: file.ufsUrl,
          key: file.key,
          name: attachment.name,
          type: fileType,
          size: file.size,
        };
      } catch (error) {
        console.error("❌ Error saving lesson attachment to DB:", error);

        // Si l'insertion en DB échoue, supprimer le fichier d'UploadThing
        try {
          const utapi = new UTApi();
          await utapi.deleteFiles(file.key);
        } catch (deleteError) {
          console.error(
            "❌ Error deleting file from UploadThing:",
            deleteError,
          );
        }

        throw new UploadThingError("Failed to save attachment to database");
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

// Fonction utilitaire pour déterminer le type de fichier
function getFileType(mimeType: string): string {
  const typeMap: Record<string, string> = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "ppt",
    "application/vnd.ms-powerpoint": "ppt",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "doc",
    "application/msword": "doc",
    "application/zip": "zip",
    "text/plain": "txt",
    "text/markdown": "md",
    "image/": "image", // Pour tous les types d'images
  };

  for (const [key, value] of Object.entries(typeMap)) {
    if (mimeType.includes(key)) return value;
  }

  return "other";
}
