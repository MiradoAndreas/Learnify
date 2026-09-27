import { openai } from "@ai-sdk/openai";
import { task } from "@trigger.dev/sdk";
import { generateText } from "ai";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { messages, userLearningProfiles } from "@/db/schema";

export const updateLearningProfileTask = task({
  id: "update-learning-profile",
  run: async (payload: { userId: string; conversationId: string }) => {
    const recent = await db
      .select({ role: messages.role, content: messages.content })
      .from(messages)
      .where(eq(messages.conversationId, payload.conversationId))
      .orderBy(desc(messages.createdAt))
      .limit(10);
    const transcript = recent
      .reverse()
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    const [existing] = await db
      .select({ summary: userLearningProfiles.summary })
      .from(userLearningProfiles)
      .where(eq(userLearningProfiles.userId, payload.userId))
      .limit(1);

    const { text: summary } = await generateText({
      model: openai("gpt-4o-mini"),
      system:
        "You maintain a short rolling profile of a student's learning preferences — topics they're drawn to, their level, how they like things explained, recurring misconceptions. Rewrite the profile below to fold in anything the new exchange reveals. Keep it under 120 words, plain prose, no bullet points. If nothing new is worth keeping, return the profile unchanged.",
      prompt: `Current profile:\n${existing?.summary || "(none yet)"}\n\nNew exchange:\n${transcript}\n\nUpdated profile:`,
    });

    await db
      .insert(userLearningProfiles)
      .values({ userId: payload.userId, summary })
      .onConflictDoUpdate({
        target: userLearningProfiles.userId,
        set: { summary, updatedAt: new Date() },
      });
  },
});
