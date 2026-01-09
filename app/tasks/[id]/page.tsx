"use client";

import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Task } from "@/interfaces/task.interface";
import { Project } from "@/interfaces/project.interface";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { renderBadge } from "@/utils/render-badge.util";
import { renderPriorityFlag } from "@/utils/render-priority.util";
import formattedDate from "@/utils/date.util";
import {
  Calendar,
  MessageSquare,
  Tag,
  ArrowLeft,
  Pencil,
  Trash2,
  Flag,
} from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const fetchTask = async (id: string): Promise<Task> => {
  const res = await fetch(`/api/tasks`);
  if (!res.ok) throw new Error("Failed to fetch task");
  const tasks = await res.json();
  const task = tasks.find((t: Task) => t.id === id);
  if (!task) throw new Error("Task not found");
  return task;
};

const fetchProjects = async (): Promise<Project[]> => {
  const res = await fetch("/api/projects");
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
};

export default function TaskById() {
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    data: task,
    isLoading: taskLoading,
    isError: taskError,
    refetch: refetchTask,
  } = useQuery({
    queryKey: ["task", id],
    queryFn: () => fetchTask(id),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to delete task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", id] });
      router.push("/tasks");
    },
  });

  const handleDelete = () => {
    deleteTaskMutation.mutate();
  };

  if (taskLoading) {
    return <LoadingState message="Loading task..." fullScreen />;
  }

  if (taskError || !task) {
    return (
      <ErrorState
        title="Task not found"
        message="We couldn't find the task you're looking for."
        onRetry={refetchTask}
        fullScreen
      />
    );
  }

  const project = projects.find((p) => p.id === task.projectId);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/tasks">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tasks
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        {/* Task Header */}
        <div>
          <div className="flex items-start gap-4">
            <div className="mt-2">
              <Checkbox checked={task.status === "done"} className="mt-1" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <h1 className="text-3xl font-bold mb-2">{task.title}</h1>
                <div className="flex gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={`/tasks/${task.id}/edit`}>
                        <span className="cursor-pointer hover:text-blue-500 transition-colors">
                          <Pencil />
                        </span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit Task</p>
                    </TooltipContent>
                  </Tooltip>
                  <p>|</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        {" "}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="cursor-pointer hover:text-red-500 transition-colors">
                              <Trash2 />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete your task and remove its data
                                from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDelete}>
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete Task</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="flex gap-2 items-center flex-wrap">
                {renderBadge(task.status)}
                {renderPriorityFlag(task.priority)}
                {project && (
                  <Badge variant="outline" className="bg-gray-100">
                    {project.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Task Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Due Date:</span>
                <span className="text-sm">{formattedDate(task.dueDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Tags:</span>
                <div className="flex gap-1 flex-wrap">
                  {task.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-muted-foreground"></Flag>
                <span className="text-sm font-medium">Priority:</span>
                <span className="text-sm">{task.priority}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {task.description}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Subtasks */}
        {task.subtasks && task.subtasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Subtasks</CardTitle>
              <CardDescription>
                {task.subtasks.filter((s) => s.completed).length} of{" "}
                {task.subtasks.length} completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {task.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-3">
                    <Checkbox checked={subtask.completed} />
                    <span
                      className={`text-sm ${
                        subtask.completed
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comments */}
        {task.comments && task.comments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comments ({task.comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {task.comments.map((comment) => (
                  <div key={comment.id} className="border-l-2 pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">
                        {comment.author}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formattedDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
