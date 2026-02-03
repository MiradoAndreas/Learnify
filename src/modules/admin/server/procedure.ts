import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";

import { eq } from "drizzle-orm";

import { db } from "@/db";

import z, { nanoid } from "zod";
import { trainerApplicationSchema, trainerProfiles } from "@/db/schema";

// export const adminRouter = createTRPCRouter({
//   review: protectedProcedure
//     .input(
//       z.object({
//         userId: z.string(),
//         status: z.enum(["approved", "rejected"]),
//       })
//     )
//     .mutation(async ({ ctx, input }) => {
//       const { session } = ctx.auth;
//       await db
//         .update(trainerProfiles)
//         .set({
//           status: input.status,
//           reviewedAt: new Date(),
//         })
//         .where(eq(trainerProfiles.userId, input.userId));

//       return { success: true };
//     }),
// });
