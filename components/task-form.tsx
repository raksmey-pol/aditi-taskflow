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
import { redirect, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export function TaskForm({
  taskId,
  onSuccess,
}: {
  taskId?: string;
  onSuccess?: () => void;
}) {
  const isEdit = !!taskId;
  const { data: task, isLoading } = useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${taskId}`);
      if (!res.ok) throw new Error("Failed to fetch task");
      return res.json();
    },
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<Task>({
    resolver: zodResolver(taskSchema),
    mode: "onChange",
    // defaultValues: {
    //   priority: undefined,
    //   status: undefined,
    // }
  });

  useEffect(() => {
    if (task) {
      reset({
        taskId: task.id,
        title: task.title,
        description: task.description,
        projectId: task.projectId,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
      });
    }
  }, [task, reset]);

  const router = useRouter();
  const onSubmit = async (data: Task) => {
    if (isEdit) {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });

      console.log("is Edit Triggered");
    } else {
      await fetch("/api/tasks", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      console.log("is Created Triggered");
    }
    reset();
    onSuccess?.();
    router.push("/tasks");
  };

  if (isEdit && isLoading) {
    return <div>Loading task…</div>;
  }

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

        <Field data-invalid={!!errors.projectId}>
          <FieldLabel htmlFor="projectId">Project ID</FieldLabel>
          <Input
            id="projectId"
            {...register("projectId")}
            placeholder="Enter project ID"
          />
          <FieldError errors={[errors.projectId]} />
        </Field>

        <Field data-invalid={!!errors.priority}>
          <FieldLabel htmlFor="priority">Priority</FieldLabel>
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <Select
                key={`priority-${field.value}`}
                onValueChange={field.onChange}
                value={field.value}
                defaultValue={field.value}
              >
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

        <Field data-invalid={!!errors.status}>
          <FieldLabel htmlFor="status">Status</FieldLabel>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                key={`status-${field.value}`}
                onValueChange={field.onChange}
                value={field.value}
                defaultValue={field.value}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.status]} />
        </Field>

        <Field data-invalid={!!errors.dueDate}>
          <FieldLabel htmlFor="dueDate">Due Date</FieldLabel>
          <Input id="dueDate" type="date" {...register("dueDate")} />
          <FieldError errors={[errors.dueDate]} />
        </Field>

        <Button type="submit" disabled={isSubmitting}>
          {isEdit
            ? isSubmitting
              ? "Editing..."
              : "Edit Task"
            : isSubmitting
            ? "Creating..."
            : "Create Task"}
        </Button>
      </FieldSet>
    </form>
  );
}
