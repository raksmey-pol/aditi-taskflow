"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";

import { Calendar, MessageSquare, Paperclip, Search } from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import formattedDate from "@/utils/date.util";
import { useTopBarStore } from "@/stores/task-topbar.store";
import { Task } from "@/interfaces/task.interface";
import { Project } from "@/interfaces/project.interface";
import { renderBadge } from "@/utils/render-badge.util";
import { renderPriorityFlag } from "@/utils/render-priority.util";
import Link from "next/link";

/* ---------------------- Queries ---------------------- */

const fetchTasks = async (): Promise<Task[]> => {
  const res = await fetch("/api/tasks");
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
};

const fetchProjects = async (): Promise<Project[]> => {
  const res = await fetch("/api/projects");
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
};

/* ---------------------- Component ---------------------- */

export default function TasksList() {
  const queryClient = useQueryClient();
  const setTopBar = useTopBarStore((s) => s.setActions);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  /* ---------- Queries ---------- */

  const {
    data: tasks = [],
    isLoading: tasksLoading,
    isError: tasksError,
    refetch: refetchTasks,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  });

  const {
    data: projects = [],
    isLoading: projectsLoading,
    isError: projectsError,
    refetch: refetchProjects,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  /* ---------- Project lookup (O(1)) ---------- */

  const projectMap = useMemo(() => {
    return new Map(projects.map((p) => [p.id, p.name]));
  }, [projects]);

  const projectName = (id: string) => projectMap.get(id) ?? "Project not found";

  /* ---------- Filter and Search ---------- */

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          projectName(task.projectId).toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [tasks, statusFilter, searchQuery, projectName]);

  /* ---------- Mutation (optimistic update) ---------- */

  const updateTaskStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (!res.ok) throw new Error("Update failed");
    },

    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);

      queryClient.setQueryData<Task[]>(["tasks"], (old) =>
        old?.map((task) => (task.id === id ? { ...task, status } : task))
      );

      return { previousTasks };
    },

    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(["tasks"], ctx?.previousTasks);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  /* ---------- Top bar ---------- */

  useEffect(() => {
    setTopBar({
      total_tasks: (
        <div>
          <h1 className="font-bold text-xl">Tasks</h1>
          <p>
            {filteredTasks.length} of {tasks.length} tasks
          </p>
        </div>
      ),
      actions: (
        <Button asChild>
          <Link href="/tasks/new">Add Task</Link>
        </Button>
      ),
    });

    return () =>
      useTopBarStore.getState().setActions({
        total_tasks: null,
        actions: null,
      });
  }, [filteredTasks.length, tasks.length, setTopBar]);

  /* ---------- Loading & error ---------- */

  if (tasksLoading || projectsLoading) {
    return <LoadingState message="Loading tasks..." fullScreen />;
  }

  if (tasksError || projectsError) {
    return (
      <ErrorState
        title="Failed to load tasks"
        message="We couldn't load your tasks. Please check your connection and try again."
        onRetry={() => {
          refetchTasks();
          refetchProjects();
        }}
        fullScreen
      />
    );
  }

  /* ---------- UI ---------- */

  return (
  <div className="p-4">
    {/* Filters + Search */}
    <div className="flex">
      <div className="flex gap-3">
        <Button
          variant={statusFilter === null ? "default" : "outline"}
          onClick={() => setStatusFilter(null)}
        >
          All
        </Button>
        <Button
          variant={statusFilter === "todo" ? "default" : "outline"}
          onClick={() => setStatusFilter("todo")}
        >
          Todo
        </Button>
        <Button
          variant={statusFilter === "in-progress" ? "default" : "outline"}
          onClick={() => setStatusFilter("in-progress")}
        >
          In Progress
        </Button>
        <Button
          variant={statusFilter === "done" ? "default" : "outline"}
          onClick={() => setStatusFilter("done")}
        >
          Done
        </Button>
      </div>

      <div className="relative ml-auto">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>

    {/* Tasks */}
    <div className="mt-6 space-y-4">
      {filteredTasks.length === 0 ? (
        <p className="text-muted-foreground">No tasks found</p>
      ) : (
        filteredTasks.map((task) => (
          <div key={task.id} className="p-4 border rounded-lg hover:bg-muted/30 transition">
            <div className="flex items-center justify-between">

              {/* LEFT SIDE */}
              <div className="flex gap-4 items-center flex-1">

                {/* Checkbox (NOT clickable for navigation) */}
                <Checkbox
                  checked={task.status === "done"}
                  onCheckedChange={() =>
                    updateTaskStatus.mutate({
                      id: task.id,
                      status: task.status === "done" ? "todo" : "done",
                    })
                  }
                />

                {/* Title + Description = clickable */}
                <Link
                  href={`/tasks/${task.id}`}
                  className="flex-1 cursor-pointer"
                >
                  <div>
                    <div className="flex gap-3 items-center">
                      <h3
                        className={cn(
                          "font-semibold",
                          task.status === "done" && "line-through opacity-50"
                        )}
                      >
                        {task.title}
                      </h3>
                      {renderBadge(task.status)}
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {task.description}
                    </p>
                  </div>
                </Link>
              </div>

              {/* RIGHT SIDE (also clickable) */}
              <Link
                href={`/tasks/${task.id}`}
                className="flex gap-4 items-center text-sm text-muted-foreground cursor-pointer"
              >
                <h4 className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-600">
                  {projectName(task.projectId)}
                </h4>

                <div className="flex gap-1 items-center">
                  <MessageSquare className="h-4 w-4" />
                  <span>{task.comments?.length ?? 0}</span>
                </div>

                <div className="flex gap-1 items-center">
                  <Paperclip className="h-4 w-4" />
                  <span>0</span>
                </div>

                {renderPriorityFlag(task.priority)}

                <div className="flex gap-1 items-center">
                  <Calendar className="h-4 w-4" />
                  <span>{formattedDate(task.dueDate)}</span>
                </div>

                <span>JD</span>
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

}
