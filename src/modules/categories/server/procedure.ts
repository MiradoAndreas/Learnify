import { db } from "@/db";
import { courseCategories } from "@/db/schema";

import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

export const categoriesRouter = createTRPCRouter({
  getMany: baseProcedure.query(async () => {
    const data = await db.select().from(courseCategories);
    return data;
  }),
});
