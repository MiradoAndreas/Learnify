import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { teacherRouter } from "@/modules/teachers/server/procedure";
import { categoriesRouter } from "@/modules/categories/server/procedure";
import { coursesRouter } from "@/modules/courses/server/procedure";
import { userRouter } from "@/modules/users/server/procedure";
import { searchRouter } from "@/modules/search/server/procedure";

export const appRouter = createTRPCRouter({
  user: userRouter,
  teacher: teacherRouter,
  category: categoriesRouter,
  course: coursesRouter,
  search: searchRouter
});
// export type definition of API
export type AppRouter = typeof appRouter;
