import { z } from "zod";

export const taskSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(50, "Title must be at most 50 characters"),
  description: z.string().max(150, "Maximum 150 characters").optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueDate: z.string().min(1),
  tags: z.array(z.string()).optional(),
  projectId: z.string().min(1),
});

export type Task = z.infer<typeof taskSchema>;
