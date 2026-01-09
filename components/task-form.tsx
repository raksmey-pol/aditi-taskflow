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
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";

export function TaskForm({
  taskId,
  onSuccess,
}: {
  taskId?: string;
  onSuccess?: () => void;
}) {
  const isEdit = !!taskId;
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: task,
    isLoading,
    isError,
    refetch,
  } = useQuery({
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
    formState: { errors },
    reset,
  } = useForm<Task>({
    resolver: zodResolver(taskSchema),
    mode: "onChange",
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: Task) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to create task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      reset();
      onSuccess?.();
      router.push("/tasks");
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (data: Task) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to update task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      reset();
      onSuccess?.();
      router.push("/tasks");
    },
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

  const onSubmit = async (data: Task) => {
    if (isEdit) {
      updateTaskMutation.mutate(data);
    } else {
      createTaskMutation.mutate(data);
    }
  };

  const isSubmitting =
    createTaskMutation.isPending || updateTaskMutation.isPending;

  if (isEdit && isLoading) {
    return <LoadingState message="Loading task form..." />;
  }

  if (isEdit && isError) {
    return (
      <ErrorState
        title="Failed to load task"
        message="We couldn't load the task data. Please try again."
        onRetry={refetch}
      />
    );
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
