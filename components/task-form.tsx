"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldSet, Field, FieldLabel, FieldError } from "./ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema, Task } from "@/validations/task.schema";
import { useForm, Controller } from "react-hook-form";

export function TaskForm({ onSuccess }: { onSuccess?: () => void }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<Task>({
    resolver: zodResolver(taskSchema),
    mode: "onChange",
    defaultValues: {
      priority: undefined
    }
  });

  const onSubmit = async (data: Task) => {
    await fetch("/api/tasks", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });

    reset();
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldSet>
        <Field data-invalid={!!errors.title}>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input
            id="title"
            {...register("title")}
            placeholder="Enter task title"
          />
          <FieldError errors={[errors.title]} />
        </Field>

        <Field data-invalid={!!errors.description}>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Enter task description (optional)"
            rows={3}
          />
          <FieldError errors={[errors.description]} />
        </Field>

        <Field data-invalid={!!errors.priority}>
          <FieldLabel htmlFor="priority">Priority</FieldLabel>
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.priority]} />
        </Field>

        <Field data-invalid={!!errors.dueDate}>
          <FieldLabel htmlFor="dueDate">Due Date</FieldLabel>
          <Input id="dueDate" type="date" {...register("dueDate")} />
          <FieldError errors={[errors.dueDate]} />
        </Field>

        <Field data-invalid={!!errors.projectId}>
          <FieldLabel htmlFor="projectId">Project ID</FieldLabel>
          <Input
            id="projectId"
            {...register("projectId")}
            placeholder="Enter project ID"
          />
          <FieldError errors={[errors.projectId]} />
        </Field>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Task"}
        </Button>
      </FieldSet>
    </form>
  );
}
