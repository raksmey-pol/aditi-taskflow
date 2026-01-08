"use client";

import { useQuery } from "@tanstack/react-query";
import { GET } from "../api/projects/route";
import { Avatar, AvatarFallback} from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

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
  const { data, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await GET();
      return response.json();
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading projects</p>;

  return (
    <div className="space-y-6">
      {data.map((project: Project) => {
        const progress =
          (project.tasksCompleted / project.tasksTotal) * 100;
        return (
          <div
            key={project.id}
            className="bg-white rounded-lg border p-5"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${project.color}`}
                  />
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
                  <Progress value={progress} className="w-[60%]" />
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-black rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
              <div className="flex -space-x-2">
                {/* fake avatars like your UI */}
                <Avatar>
                    <AvatarFallback className="bg-indigo-500  text-white" >JD</AvatarFallback>
                </Avatar>
                <Avatar>
                    <AvatarFallback className="bg-indigo-500  text-white" >AK</AvatarFallback>
                </Avatar>
                <Avatar>
                    <AvatarFallback className="bg-indigo-500  text-white" >SL</AvatarFallback>
                </Avatar>
              </div>

              <span>{project.dueDate}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}