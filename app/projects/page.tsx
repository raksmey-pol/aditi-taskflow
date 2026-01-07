"use client";

import { useQuery } from "@tanstack/react-query";
import { GET } from "../api/projects/route";
import { Progress } from "@/components/ui/progress";



export default function Projects() {
  

  const progressBar = (taskCompleted: number, taskTotal: number) => {
    const progressValue = taskTotal > 0 ? (taskCompleted / taskTotal) * 100 : 0;
    return <div>
      <Progress value={progressValue} />
    </div>
  };

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
    <div className="grid gap-4">
      {data?.map((project: any) => (
        <div
          key={project.id}
          className={`p-4 rounded ${project.color}`}
        >
          <h2 className="text-lg font-bold">{project.name}</h2>
          <p className="text-sm">{project.description}</p>

          <div className="mt-2 text-sm">
            <p>
              Tasks: {project.tasksCompleted}/{project.tasksTotal}
            </p>
            <p>Due: {project.dueDate}</p>
          </div>
          {progressBar(project.tasksCompleted, project.tasksTotal)}
        </div>
      ))}
    </div>
  );
}