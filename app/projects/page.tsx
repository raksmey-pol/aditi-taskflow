"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { GET } from "../api/projects/route";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useTopBarStore } from "@/stores/task-topbar.store";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";

interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  tasksCompleted: number;
  tasksTotal: number;
  dueDate: string;
}

export default function Projects() {
  const {
    data: projects = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await GET();
      return response.json();
    },
  });

  const setTopBar = useTopBarStore((s) => s.setActions);

  useEffect(() => {
    setTopBar({
      total_tasks: (
        <div>
          <h1 className="font-bold text-xl">Projects</h1>
          <p>{projects.length} total project</p>
        </div>
      ),
      actions: (
        <Button asChild>
          <Link href="">New Project</Link>
        </Button>
      ),
    });

    return () =>
      useTopBarStore.getState().setActions({
        total_tasks: null,
        actions: null,
      });
  }, [projects.length, setTopBar]);

  if (isLoading)
    return <LoadingState message="Loading projects..." fullScreen />;
  if (error)
    return (
      <ErrorState
        title="Failed to load projects"
        message="We couldn't load your projects. Please try again."
        onRetry={refetch}
        fullScreen
      />
    );

  return (
    <div className="space-y-6 p-8">
      {projects.map((project: Project) => {
        const progress = (project.tasksCompleted / project.tasksTotal) * 100;
        return (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="bg-white rounded-lg border p-5 block"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${project.color}`} />
                  <h3 className="font-semibold text-gray-900">
                    {project.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {project.description}
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-4">
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-gray-500 mb-1">Progress</p>
                <span className="text-sm text-gray-500 ">
                  {project.tasksCompleted}/{project.tasksTotal} tasks
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <Progress value={progress} className="w-[60%]" />
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
              <div className="flex -space-x-2">
                {/* fake avatars like your UI */}
                <Avatar>
                  <AvatarFallback className="bg-indigo-500  text-white">
                    JD
                  </AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback className="bg-indigo-500  text-white">
                    AK
                  </AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback className="bg-indigo-500  text-white">
                    SL
                  </AvatarFallback>
                </Avatar>
              </div>

              <span>{project.dueDate}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
