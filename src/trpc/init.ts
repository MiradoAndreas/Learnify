import { db } from "@/db";
import { courseEnrollments, trainerProfiles } from "@/db/schema";
import { auth } from "@/lib/auth";
import { initTRPC, TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { cache } from "react";
import superjson from "superjson";

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return { userId: "user_123" };
});
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
   transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    });
  }
  return next({ ctx: { ...ctx, auth: session } });
});

export const teacherProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    // Récupérer le profil professeur
    const trainer = await db
      .select({
        status: trainerProfiles.status,
        id: trainerProfiles.id,
      })
      .from(trainerProfiles)
      .where(eq(trainerProfiles.userId, ctx.auth.user.id))
      .limit(1);

    // Vérifier si l'utilisateur a un profil professeur
    if (!trainer[0]) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Profil professeur non trouvé",
      });
    }

    // Vérifier le statut
    if (trainer[0].status !== "success") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Votre compte professeur n'est pas encore activé",
      });
    }

    // Ajouter les infos professeur au contexte
    return next({
      ctx: {
        ...ctx,
        trainer: trainer[0], // ← Enrichir le contexte
      },
    });
  }
);

export const paidCourseProcedure = protectedProcedure.use(
  async ({ ctx, next, getRawInput }) => {
    // Récupérer l'input de la procédure appelante
    const input = await getRawInput() as { courseId?: string } | undefined;
    
    // Si pas de courseId dans l'input, on ne peut pas vérifier
    if (!input?.courseId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "courseId requis pour vérifier l'accès au cours payant",
      });
    }

    // Vérifier si l'utilisateur a accès au cours
    const [enrollment] = await db
      .select({ id: courseEnrollments.id })
      .from(courseEnrollments)
      .where(
        and(
          eq(courseEnrollments.userId, ctx.auth.user.id),
          eq(courseEnrollments.courseId, input.courseId),
          eq(courseEnrollments.status, "active")
        )
      )
      .limit(1);

    if (!enrollment) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Vous devez acheter ce cours pour y accéder",
      });
    }

    // Ajouter l'enrollment au contexte pour utilisation ultérieure
    return next({
      ctx: {
        ...ctx,
        enrollment: enrollment,
        courseId: input.courseId,
      },
    });
  }
);
