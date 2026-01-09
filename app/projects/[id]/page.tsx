"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Folder } from "lucide-react";
import { colorMap } from "@/utils/color-map.util";
import { Project } from "@/interfaces/project.interface";
import { Task } from "@/interfaces/task.interface";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { renderBadge } from "@/utils/render-badge.util";
import { useState, useEffect } from "react";
import { useTopBarStore } from "@/stores/task-topbar.store";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";

export default function ProjectPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [taskFilter, setTaskFilter] = useState<"all" | "active" | "completed">(
    "all"
  );
  const setTopBar = useTopBarStore((s) => s.setActions);

  const fetchProject = async () => {
    const res = await fetch("/api/projects");
    if (!res.ok) throw new Error("Failed to fetch projects");
    const projects: Project[] = await res.json();
    return projects.find((p) => p.id === id);
  };

  const fetchTaskByProjectId = async () => {
    const res = await fetch(`/api/projects/${id}/tasks`);
    if (!res.ok) throw new Error("Failed to fetch tasks in projectId");
    return await res.json();
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["project", id],
    queryFn: fetchProject,
  });

  const {
    data: tasks = [],
    isLoading: isTasksLoading,
    error: isTaskError,
    refetch: refetchTasks,
  } = useQuery({
    queryKey: ["tasks", id],
    queryFn: fetchTaskByProjectId,
  });

  const getTaskCountByStatus = (
    tasks: Task[],
    statusToFind: string
  ): number => {
    if (!Array.isArray(tasks)) return 0;
    return tasks.filter((task) => task.status === statusToFind).length;
  };

  const getFilteredTasks = () => {
    if (!Array.isArray(tasks)) return [];
    if (taskFilter === "all") return tasks;
    if (taskFilter === "active")
      return tasks.filter((task) => task.status !== "done");
    if (taskFilter === "completed")
      return tasks.filter((task) => task.status === "done");
    return tasks;
  };

  const filteredTasks = getFilteredTasks();

  /* ---------- Top bar ---------- */

  useEffect(() => {
    if (data) {
      setTopBar({
        total_tasks: (
          <div>
            <h1 className="font-bold text-xl">{data.name}</h1>
            <p>{tasks.length} total tasks</p>
          </div>
        ),
        actions: (
          <Button asChild>
            <Link href="/tasks/new">Add Task</Link>
          </Button>
        ),
      });
    }

    return () =>
      useTopBarStore.getState().setActions({
        total_tasks: null,
        actions: null,
      });
  }, [data, tasks.length, setTopBar]);

  if (isLoading)
    return <LoadingState message="Loading project..." fullScreen />;
  if (error || !data)
    return (
      <ErrorState
        title="Project not found"
        message="We couldn't find the project you're looking for."
        onRetry={refetch}
        fullScreen
      />
    );

  return (
    <div className="p-8">
      <div className="pb-8 flex gap-4 items-center">
        <span className="text-gray-600"> Projects {">"}</span>
        <span className="text-black font-bold"> {data.name}</span>
      </div>
      {/* {"PROJECTS"} */}
      <div className="p-4 ">
        <div className={`flex gap-4 items-center`}>
          <div
            className={`size-10 ${data.color} rounded-md flex items-center justify-center`}
          >
            <Folder className="size-5 text-white" />
          </div>

          <div>
            <h1 className="text-xl font-bold">{data.name}</h1>
            <p>{data.description}</p>
          </div>
        </div>

        <div className="flex gap-2 mt-4 w-full h-30">
          <div className="flex flex-col justify-center flex-1 p-4 border rounded h-full items-center">
            <span className="text-3xl font-bold">{tasks.length}</span>
            <span>Total Tasks</span>
          </div>

          <div className="flex flex-col justify-center flex-1 p-4 border rounded h-full items-center">
            <span className="text-3xl font-bold text-green-600">
              {getTaskCountByStatus(tasks, "done")}
            </span>
            <span>Completed</span>
          </div>

          <div className="flex flex-col justify-center flex-1 p-4 border rounded h-full items-center">
            <span className="text-3xl font-bold">
              {getTaskCountByStatus(tasks, "in-progress")}
            </span>
            <span>In Progress</span>
          </div>

          <div className="flex flex-col justify-center flex-1 p-4 border rounded h-full items-center">
            <span className="text-3xl font-bold">
              {getTaskCountByStatus(tasks, "todo")}
            </span>
            <span>To Do</span>
          </div>
        </div>

        {/* Task List Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Tasks</h2>
          </div>

          {/* Task Filter Tabs */}
          <div className="flex gap-4 border-b mb-4">
            <button
              onClick={() => setTaskFilter("all")}
              className={`pb-2 px-1 ${
                taskFilter === "all"
                  ? "border-b-2 border-black font-medium"
                  : "text-gray-600"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTaskFilter("active")}
              className={`pb-2 px-1 ${
                taskFilter === "active"
                  ? "border-b-2 border-black font-medium"
                  : "text-gray-600"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setTaskFilter("completed")}
              className={`pb-2 px-1 ${
                taskFilter === "completed"
                  ? "border-b-2 border-black font-medium"
                  : "text-gray-600"
              }`}
            >
              Completed
            </button>
          </div>

          {/* Task List */}
          <div className="space-y-2">
            {isTasksLoading ? (
              <p>Loading tasks...</p>
            ) : filteredTasks.length === 0 ? (
              <p className="text-gray-500">No tasks found</p>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Checkbox
                    checked={task.status === "done"}
                    className="mt-0.5"
                  />
                  <span
                    className={`flex-1 ${
                      task.status === "done" ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {task.title}
                  </span>
                  {renderBadge(task.status)}
                  <Avatar className="size-7">
                    <AvatarFallback className="text-xs bg-purple-500 text-white">
                      JD
                    </AvatarFallback>
                  </Avatar>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Team Members Section */}
        <div className="mt-8">
          <h3 className="font-semibold mb-2">Team Members</h3>
          <p className="text-sm text-gray-600 mb-4">3 members</p>
          <div className="flex gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="size-8">
                <AvatarFallback className="text-xs bg-purple-500 text-white">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <div className="font-medium">John Doe</div>
                <div className="text-gray-500">Lead</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
