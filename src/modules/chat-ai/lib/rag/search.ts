import { openai } from "@ai-sdk/openai";
import { embed } from "ai";
import { sql } from "drizzle-orm";

import { db } from "@/db";

interface ChunkMatch {
  id: string;
  lessonId: string;
  content: string;
  similarity: number;
}

/**
 * Cosine similarity search over lesson_chunks via pgvector's `<=>` operator.
 * Raw SQL because drizzle-orm has no first-class vector operator — adjust
 * table/column names if your migration named them differently, and check
 * whether your driver returns rows directly or under `.rows` (node-postgres
 * vs postgres.js/neon-http differ here).
 */
export async function searchLessonChunks(
  query: string,
  {
    lessonId,
    courseLessonIds,
    limit = 5,
  }: {
    lessonId?: string;
    courseLessonIds?: string[];
    limit?: number;
  },
): Promise<ChunkMatch[]> {
  const { embedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: query,
  });
  const vectorLiteral = `[${embedding.join(",")}]`;

  const whereClause = lessonId
    ? sql`where lc.lesson_id = ${lessonId}`
    : courseLessonIds?.length
      ? sql`where lc.lesson_id = any(${courseLessonIds})`
      : sql``;

  type Row = {
    id: string;
    lesson_id: string;
    content: string;
    similarity: number;
  };

  const result = await db.execute<Row>(sql`
    select lc.id, lc.lesson_id, lc.content,
           1 - (lc.embedding <=> ${vectorLiteral}::vector) as similarity
    from lesson_chunks lc
    ${whereClause}
    order by lc.embedding <=> ${vectorLiteral}::vector
    limit ${limit}
  `);

  // node-postgres wraps rows under `.rows`; some drivers (postgres.js,
  // neon-http) hand back the array directly. Keep whichever branch matches
  // your driver and drop the other.
  const rows: Row[] =
    "rows" in result ? (result.rows as Row[]) : (result as unknown as Row[]);

  return rows.map((row) => ({
    id: row.id,
    lessonId: row.lesson_id,
    content: row.content,
    similarity: Number(row.similarity),
  }));
}
