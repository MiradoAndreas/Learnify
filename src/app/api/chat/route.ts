import { openai } from "@ai-sdk/openai";
import { tasks } from "@trigger.dev/sdk";
import { streamText } from "ai";
import { asc, eq } from "drizzle-orm";
import { after } from "next/server";

import { db } from "@/db";

import { auth } from "@/lib/auth";
import { conversations, messages, userLearningProfiles } from "@/db/schema";
import { searchLessonChunks } from "@/modules/chat-ai/lib/rag/search";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { conversationId, message, lessonId } = (await req.json()) as {
    conversationId: string;
    message: string;
    lessonId?: string;
  };

  const [conversation] = await db
    .select({ id: conversations.id, userId: conversations.userId })
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);
  if (!conversation || conversation.userId !== session.user.id) {
    return new Response("Not found", { status: 404 });
  }

  await db.insert(messages).values({
    conversationId,
    role: "user",
    content: message,
  });

  const [[profile], history, ragMatches] = await Promise.all([
    db
      .select({ summary: userLearningProfiles.summary })
      .from(userLearningProfiles)
      .where(eq(userLearningProfiles.userId, session.user.id))
      .limit(1),
    db
      .select({
        role: messages.role,
        content: messages.content,
      })
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt)),
    lessonId ? searchLessonChunks(message, { lessonId }) : Promise.resolve([]),
  ]);

  const context = ragMatches.map((chunk) => chunk.content).join("\n---\n");

  const system = [
    "You are a patient tutor helping a student learn.",
    profile?.summary
      ? `What you know about this student: ${profile.summary}`
      : null,
    context ? `Relevant course material:\n${context}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system,
    messages: history
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    onFinish: async ({ text }) => {
      after(async () => {
        await db.insert(messages).values({
          conversationId,
          role: "assistant",
          content: text,
        });

        try {
          await tasks.trigger("update-learning-profile", {
            userId: session.user.id,
            conversationId,
          });
        } catch (error) {
          // Never let a failed trigger take down the response — it already
          // reached the client. Just make the failure visible in the logs.
          console.error("update-learning-profile trigger failed", error);
        }
      });
    },
  });

  return result.toUIMessageStreamResponse();
}
