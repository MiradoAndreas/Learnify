import { openai } from "@ai-sdk/openai";
import { task } from "@trigger.dev/sdk/v3";
import { embedMany } from "ai";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { courseLessons } from "@/db/schema";
import { lessonChunks } from "@/db/schema";
import { chunkText } from "@/modules/chat-ai/lib/rag/chunck";

export const embedLessonTask = task({
  id: "embed-lesson",
  run: async (payload: { lessonId: string }) => {
    const [lesson] = await db
      .select({
        title: courseLessons.title,
        description: courseLessons.description,
      })
      .from(courseLessons)
      .where(eq(courseLessons.id, payload.lessonId))
      .limit(1);
    if (!lesson) return;

    // Title + description today; fold in a transcript field here once one
    // exists on courseLessons — that's the richer source for RAG.
    const source = [lesson.title, lesson.description]
      .filter(Boolean)
      .join("\n\n");
    const chunks = chunkText(source);
    if (chunks.length === 0) return;

    const { embeddings } = await embedMany({
      model: openai.embedding("text-embedding-3-small"),
      values: chunks,
    });

    // Re-embedding replaces the lesson's chunks outright rather than diffing
    // them — simpler, and cheap enough at this content size.
    await db
      .delete(lessonChunks)
      .where(eq(lessonChunks.lessonId, payload.lessonId));
    await db.insert(lessonChunks).values(
      chunks.map((content, i) => ({
        lessonId: payload.lessonId,
        content,
        embedding: embeddings[i],
      })),
    );
  },
});
