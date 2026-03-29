import { db } from "@/db";
import { commentLikes, lessonComments } from "@/db/schema";
import { createTRPCRouter, paidCourseProcedure } from "@/trpc/init";
import { and, eq, sql } from "drizzle-orm";
import z from "zod";

export const commentLikesRouter = createTRPCRouter({
  like: paidCourseProcedure
    .input(
      z.object({ 
        commentId: z.uuid(),
        courseId: z.uuid(),
        lessonId: z.uuid() 
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { commentId } = input;
      const { id: userId } = ctx.auth.user;

      // Vérifier si le like existe déjà
      const [existingLike] = await db
        .select()
        .from(commentLikes)
        .where(
          and(
            eq(commentLikes.commentId, commentId),
            eq(commentLikes.userId, userId)
          )
        );

      if (existingLike) {
        // Supprimer le like
        const [deleted] = await db
          .delete(commentLikes)
          .where(
            and(
              eq(commentLikes.userId, userId),
              eq(commentLikes.commentId, commentId)
            )
          )
          .returning();

        // Mettre à jour le compteur
        await db
          .update(lessonComments)
          .set({ 
            likesCount: sql`${lessonComments.likesCount} - 1` 
          })
          .where(eq(lessonComments.id, commentId));

        return deleted;
      }

      // Ajouter le like
      const [created] = await db
        .insert(commentLikes)
        .values({ userId, commentId })
        .returning();

      // Mettre à jour le compteur
      await db
        .update(lessonComments)
        .set({ 
          likesCount: sql`${lessonComments.likesCount} + 1` 
        })
        .where(eq(lessonComments.id, commentId));

      return created;
    }),
});