"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Calendar,
  MessageSquare,
  Paperclip,
  Search,
} from "lucide-react";

import { useEffect, useMemo } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

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

  /* ---------- Queries ---------- */

  const {
    data: tasks = [],
    isLoading: tasksLoading,
    isError: tasksError,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  });

  const {
    data: projects = [],
    isLoading: projectsLoading,
    isError: projectsError,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  /* ---------- Project lookup (O(1)) ---------- */

  const projectMap = useMemo(() => {
    return new Map(projects.map((p) => [p.id, p.name]));
  }, [projects]);

  const projectName = (id: string) =>
    projectMap.get(id) ?? "Project not found";

  /* ---------- Mutation (optimistic update) ---------- */

  const updateTaskStatus = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: string;
    }) => {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (!res.ok) throw new Error("Update failed");
    },

    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const previousTasks =
        queryClient.getQueryData<Task[]>(["tasks"]);

      queryClient.setQueryData<Task[]>(["tasks"], (old) =>
        old?.map((task) =>
          task.id === id ? { ...task, status } : task
        )
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
          <p>{tasks.length} total tasks</p>
        </div>
      ),
      actions: <Button asChild>
  <Link href="/tasks/new">Add Task</Link>
</Button>,
    });

    return () =>
      useTopBarStore.getState().setActions({
        total_tasks: null,
        actions: null,
      });
  }, [tasks.length, setTopBar]);

  /* ---------- Loading & error ---------- */

  if (tasksLoading || projectsLoading) {
    return (
      <div className="grid place-items-center h-screen">
        <Spinner className="size-16" />
      </div>
    );
  }

  if (tasksError || projectsError) {
    return <div>Error loading data</div>;
  }

  /* ---------- UI ---------- */

  return (
    <div className="p-4">
      <div className="flex">
        <div className="flex gap-3">
          <Button variant="outline">All</Button>
          <Button variant="outline">Todo</Button>
          <Button variant="outline">In Progress</Button>
          <Button variant="outline">Done</Button>
        </div>

        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-10" placeholder="Search tasks..." />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {tasks.length === 0 ? (
          <p className="text-muted-foreground">No tasks found</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="p-4 border rounded-lg">
              <Link href={`/tasks/${task.id}`}>
              <div className="flex items-center justify-between">
                <div className="flex gap-4 items-center">
                  <Checkbox
                    checked={task.status === "done"}
                    onCheckedChange={() =>
                      updateTaskStatus.mutate({
                        id: task.id,
                        status:
                          task.status === "done"
                            ? "todo"
                            : "done",
                      })
                    }
                  />

                  <div>
                    <div className="flex gap-3">
                      <h3
                        className={cn(
                          "font-semibold",
                          task.status === "done" &&
                            "line-through opacity-50"
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
                </div>

                <div className="flex gap-3 items-center">
                  <h4 className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-600">
                    {projectName(task.projectId)}
                  </h4>

                  <div className="flex gap-1">
                    <MessageSquare className="text-gray-500" />
                    <span>{task.comments?.length ?? 0}</span>
                  </div>

                  <div className="flex gap-1">
                    <Paperclip className="text-gray-500" />
                    <span>0</span>
                  </div>

                  {renderPriorityFlag(task.priority)}

                  <div className="flex gap-1">
                    <Calendar className="text-gray-500" />
                    <span>{formattedDate(task.dueDate)}</span>
                  </div>

                  <span>JD</span>
                </div>
              </div></Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
