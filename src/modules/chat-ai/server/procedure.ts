import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { conversations, messages } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const chatRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db
      .select({
        id: conversations.id,
        title: conversations.title,
        lessonId: conversations.lessonId,
        courseId: conversations.courseId,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
      })
      .from(conversations)
      .where(eq(conversations.userId, ctx.auth.user.id))
      .orderBy(desc(conversations.updatedAt));
  }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(120).default("New chat"),
        lessonId: z.uuid().optional(),
        courseId: z.uuid().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [conversation] = await db
        .insert(conversations)
        .values({
          userId: ctx.auth.user.id,
          title: input.title,
          lessonId: input.lessonId,
          courseId: input.courseId,
        })
        .returning({
          id: conversations.id,
          title: conversations.title,
          lessonId: conversations.lessonId,
          courseId: conversations.courseId,
          createdAt: conversations.createdAt,
          updatedAt: conversations.updatedAt,
        });

      return conversation;
    }),

  rename: protectedProcedure
    .input(z.object({ id: z.uuid(), title: z.string().min(1).max(120) }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await db
        .update(conversations)
        .set({ title: input.title, updatedAt: new Date() })
        .where(
          and(
            eq(conversations.id, input.id),
            eq(conversations.userId, ctx.auth.user.id),
          ),
        )
        .returning({ id: conversations.id });

      if (!updated) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Conversation introuvable",
        });
      }
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await db
        .delete(conversations)
        .where(
          and(
            eq(conversations.id, input.id),
            eq(conversations.userId, ctx.auth.user.id),
          ),
        )
        .returning({ id: conversations.id });

      if (!deleted) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Conversation introuvable",
        });
      }
    }),

  messages: protectedProcedure
    .input(z.object({ conversationId: z.uuid() }))
    .query(async ({ ctx, input }) => {
      const [conversation] = await db
        .select({ id: conversations.id })
        .from(conversations)
        .where(
          and(
            eq(conversations.id, input.conversationId),
            eq(conversations.userId, ctx.auth.user.id),
          ),
        )
        .limit(1);

      if (!conversation) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Conversation introuvable",
        });
      }

      return db
        .select({
          id: messages.id,
          role: messages.role,
          content: messages.content,
        })
        .from(messages)
        .where(eq(messages.conversationId, input.conversationId))
        .orderBy(asc(messages.createdAt));
    }),
});
