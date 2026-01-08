import { z } from "zod";

export const taskSchema = z.object({
  taskId: z.string().optional(), 
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(50, "Title must be at most 50 characters"),
  description: z.string().max(150, "Maximum 150 characters").optional(),
  projectId: z.string().min(1),
  priority: z.enum(["low", "medium", "high"]).optional(),
  status: z.enum(["todo", "in-progress", "done"]).optional(),
  dueDate: z.string().min(1),
  onSuccess: z.function().optional(),
});

export type Task = z.infer<typeof taskSchema>;
