import { createTRPCRouter } from "@/trpc/init";
import {
  baseProcedure,

} from "@/trpc/init";

import { and, asc, desc, eq, ilike, inArray, lt, ne, or, SQL, sql } from "drizzle-orm";

import { db } from "@/db";

import {

  courseCategoryRelations,

  courseLessons,

  courses,
  courseSections,

  trainerProfiles,

  user,
} from "@/db/schema";

import z from "zod";


export const searchRouter = createTRPCRouter({


   
  
  searchCourses: baseProcedure
    .input(
      z.object({
        query: z.string().min(1).max(100).nullish(),
        categoryId: z.uuid().nullish(),
        level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        language: z.enum(["fr", "mg", "en"]).optional(),
        cursor: z
          .object({
            id: z.uuid(),
            publishedAt: z.date(),
          })
          .optional()
          .nullable(),
        limit: z.number().min(1).max(100).default(20),
        minPrice: z.number().min(0).optional(),
        maxPrice: z.number().min(0).optional(),
        sortBy: z
          .enum([
            "relevance",
            "newest",
            "price_asc",
            "price_desc",
            "popularity",
          ])
          .default("relevance"),
      })
    )
    .query(async ({ input }) => {
      const {
        query,
        categoryId,
        level,
        language,
        cursor,
        limit,
        minPrice,
        maxPrice,
        sortBy,
      } = input;

      /** ---------------------------
       *  BASE CONDITIONS
       *  --------------------------- */
      const baseConditions: SQL[] = [
        eq(courses.status, "published"),
      ];

      /** ---------------------------
       *  SEARCH (SAFE OR)
       *  --------------------------- */
      if (query?.trim()) {
        const searchTerm = `%${query.trim()}%`;

        baseConditions.push(
          sql`
            (
              ${courses.title} ILIKE ${searchTerm}
              OR ${courses.description} ILIKE ${searchTerm}
              OR ${trainerProfiles.fullName} ILIKE ${searchTerm}
              OR ${trainerProfiles.profession} ILIKE ${searchTerm}
            )
          `
        );
      }

      /** ---------------------------
       *  FILTERS
       *  --------------------------- */
      if (categoryId) {
        baseConditions.push(
          inArray(
            courses.id,
            db
              .select({ courseId: courseCategoryRelations.courseId })
              .from(courseCategoryRelations)
              .where(eq(courseCategoryRelations.categoryId, categoryId))
          )
        );
      }

      if (level) {
        baseConditions.push(eq(courses.level, level));
      }

      if (language) {
        baseConditions.push(eq(courses.language, language));
      }

      if (minPrice !== undefined) {
        baseConditions.push(sql`${courses.price} >= ${minPrice * 100}`);
      }

      if (maxPrice !== undefined) {
        baseConditions.push(sql`${courses.price} <= ${maxPrice * 100}`);
      }

      /** ---------------------------
       *  CURSOR PAGINATION (FIXED)
       *  --------------------------- */
      let cursorCondition: SQL | undefined = undefined;

      if (cursor) {
        cursorCondition = or(
          lt(courses.publishedAt, cursor.publishedAt),
          and(
            eq(courses.publishedAt, cursor.publishedAt),
            lt(courses.id, cursor.id)
          )
        );
      }

      /** ---------------------------
       *  ORDER BY
       *  --------------------------- */
      let orderByClause: SQL[] = [];

      switch (sortBy) {
        case "price_asc":
          orderByClause = [
            asc(courses.price),
            desc(courses.publishedAt),
            desc(courses.id),
          ];
          break;

        case "price_desc":
          orderByClause = [
            desc(courses.price),
            desc(courses.publishedAt),
            desc(courses.id),
          ];
          break;

        case "newest":
        case "popularity":
        case "relevance":
        default:
          orderByClause = [
            desc(courses.publishedAt),
            desc(courses.id),
          ];
          break;
      }

      /** ---------------------------
       *  MAIN QUERY
       *  --------------------------- */
      const data = await db
        .select({
          id: courses.id,
          title: courses.title,
          description: courses.description,
          price: courses.price,
          thumbnailUrl: courses.thumbnailUrl,
          level: courses.level,
          language: courses.language,
          publishedAt: courses.publishedAt,

          totalLessons: sql<number>`
            (
              SELECT COUNT(${courseLessons.id})
              FROM ${courseLessons}
              INNER JOIN ${courseSections}
                ON ${courseLessons.sectionId} = ${courseSections.id}
              WHERE ${courseSections.courseId} = ${courses.id}
            )
          `.as("totalLessons"),

          duration: sql<number>`
            COALESCE(
              (
                SELECT SUM(${courseLessons.duration})
                FROM ${courseLessons}
                INNER JOIN ${courseSections}
                  ON ${courseLessons.sectionId} = ${courseSections.id}
                WHERE ${courseSections.courseId} = ${courses.id}
              ),
              0
            )
          `.as("duration"),

          trainer: {
            id: trainerProfiles.id,
            fullName: trainerProfiles.fullName,
            profession: trainerProfiles.profession,
            image: sql<string | null>`
              COALESCE(${trainerProfiles.image}, ${user.image})
            `.as("image"),
          },
        })
        .from(courses)
        .innerJoin(trainerProfiles, eq(courses.trainerId, trainerProfiles.id))
        .innerJoin(user, eq(trainerProfiles.userId, user.id))
        .where(
          and(
            ...baseConditions,
            ...(cursorCondition ? [cursorCondition] : [])
          )
        )
        .orderBy(...orderByClause)
        .limit(limit + 1);

      /** ---------------------------
       *  CURSOR RESULT
       *  --------------------------- */
      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];

      const nextCursor =
        hasMore && lastItem
          ? {
              id: lastItem.id,
              publishedAt: lastItem.publishedAt,
            }
          : null;

      /** ---------------------------
       *  TOTAL COUNT (NO PAGINATION)
       *  --------------------------- */
      const totalResults = await db
        .select({ count: sql<number>`count(*)` })
        .from(courses)
        .innerJoin(trainerProfiles, eq(courses.trainerId, trainerProfiles.id))
        .innerJoin(user, eq(trainerProfiles.userId, user.id))
        .where(and(...baseConditions))
        .then((res) => res[0]?.count ?? 0);

      return {
        items,
        nextCursor,
        hasMore,
        totalResults,
        query,
        filters: {
          categoryId,
          level,
          language,
          minPrice,
          maxPrice,
        },
      };
    }),
});

