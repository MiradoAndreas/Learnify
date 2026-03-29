import { db } from "@/db";
import {
  lessonComments,
  commentLikes,
  user,
} from "@/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
  paidCourseProcedure,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  inArray,
  isNotNull,
  isNull,
  lt,
  or,
  sql,
} from "drizzle-orm";
import z from "zod";

export const lessonCommentsRouter = createTRPCRouter({
  remove: paidCourseProcedure
    .input(z.object({ 
      id: z.uuid(), 
      courseId: z.uuid(), 
      lessonId: z.uuid() 
    }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      const userId = ctx.auth.user.id;

      const [deleted] = await db
        .delete(lessonComments)
        .where(
          and(
            eq(lessonComments.id, id),
            eq(lessonComments.userId, userId)
          )
        )
        .returning();

      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return deleted;
    }),

  create: paidCourseProcedure
    .input(
      z.object({
        courseId: z.uuid(),
        lessonId: z.uuid(),
        parentId: z.uuid().nullish(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { lessonId, parentId, content } = input;
      const { id: userId } = ctx.auth.user;

      // Vérifier si le parent existe et n'est pas une réponse
      if (parentId) {
        const [parent] = await db
          .select()
          .from(lessonComments)
          .where(eq(lessonComments.id, parentId));

        if (!parent) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        if (parent.parentId) {
          throw new TRPCError({ code: "BAD_REQUEST" });
        }
      }

      const [created] = await db
        .insert(lessonComments)
        .values({
          lessonId,
          parentId,
          content,
          userId,
        })
        .returning();

      return created;
    }),

  getMany: paidCourseProcedure
    .input(
      z.object({
        courseId: z.uuid(),
        lessonId: z.uuid(),
        parentId: z.uuid().nullish(),
        cursor: z
          .object({
            id: z.uuid(),
            createdAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input, ctx }) => {
      const { lessonId, parentId, cursor, limit } = input;
      const viewerId = ctx.auth.user?.id;

      // CTE pour les likes de l'utilisateur connecté
      const viewerLikes = db.$with("viewer_likes").as(
        db
          .select({
            commentId: commentLikes.commentId,
          })
          .from(commentLikes)
          .where(
            viewerId
              ? eq(commentLikes.userId, viewerId)
              : undefined
          )
      );

      // CTE pour compter les réponses
      const replies = db.$with("replies").as(
        db
          .select({
            parentId: lessonComments.parentId,
            count: count(lessonComments.id).as("count"),
          })
          .from(lessonComments)
          .where(
            and(
              isNotNull(lessonComments.parentId),
              eq(lessonComments.isDeleted, false)
            )
          )
          .groupBy(lessonComments.parentId)
      );

      const [totalData, data] = await Promise.all([
        db
          .select({ count: count() })
          .from(lessonComments)
          .where(
            and(
              eq(lessonComments.lessonId, lessonId),
              isNull(lessonComments.parentId),
              eq(lessonComments.isDeleted, false)
            )
          ),

        db
          .with(viewerLikes, replies)
          .select({
            ...getTableColumns(lessonComments),
            author: {
              id: user.id,
              name: user.name,
              email: user.email,
              imageUrl: user.image,
            },
            viewerLike: viewerLikes.commentId,
            replyCount: sql<number>`COALESCE(${replies.count}, 0)`,
            likeCount: db.$count(
              commentLikes,
              eq(commentLikes.commentId, lessonComments.id)
            ),
          })
          .from(lessonComments)
          .where(
            and(
              eq(lessonComments.lessonId, lessonId),
              eq(lessonComments.isDeleted, false),
              parentId
                ? eq(lessonComments.parentId, parentId)
                : isNull(lessonComments.parentId),
              cursor
                ? or(
                    lt(lessonComments.createdAt, cursor.createdAt),
                    and(
                      eq(lessonComments.createdAt, cursor.createdAt),
                      lt(lessonComments.id, cursor.id)
                    )
                  )
                : undefined
            )
          )
          .innerJoin(user, eq(lessonComments.userId, user.id))
          .leftJoin(
            viewerLikes,
            eq(lessonComments.id, viewerLikes.commentId)
          )
          .leftJoin(
            replies,
            eq(lessonComments.id, replies.parentId)
          )
          .orderBy(desc(lessonComments.createdAt), desc(lessonComments.id))
          .limit(limit + 1),
      ]);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;

      const lastItem = items[items.length - 1];

      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            createdAt: lastItem.createdAt,
          }
        : null;

      return {
        totalCount: totalData[0].count,
        items,
        nextCursor,
      };
    }),
});