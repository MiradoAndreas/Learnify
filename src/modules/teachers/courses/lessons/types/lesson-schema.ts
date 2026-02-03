import z from "zod";

export const lessonUpdateSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z
    .string()
    .min(4, "Veuillez ajouter un desription pour être plus visible"),
  visibility: z.enum(["paid", "free"]),
  isPublished: z.boolean().optional(),
});
