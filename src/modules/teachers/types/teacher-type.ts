import z from "zod";

export const updateCourseSchema = z.object({
  id: z.uuid(),

  title: z.string().min(5).optional(),
  description: z.string().min(20).optional(),
  price: z.number().min(0).optional(),
  status: z.enum(["draft", "published"]).optional(),
});
