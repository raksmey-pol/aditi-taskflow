"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

interface Project {
  id: string;
  name: string;
  description: string;
  tasksTotal: number;
  tasksCompleted: number;
}

export default function ProjectPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
   
  const fetchProject = async () => {
    const res = await fetch("/api/projects");
    if (!res.ok) throw new Error("Failed to fetch projects");
    const projects: Project[] = await res.json();
    return projects.find(p => p.id === id);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["project", id],
    queryFn: fetchProject,
  });

  if (isLoading) return <p>Loading project...</p>;
  if (error || !data) return <p>Project not found</p>;

  return (
    <div className="p-4 border rounded">
        <span className="pb-7"> project {'>'} {data.name}</span>
        <h1 className="text-xl font-bold">{data.name}</h1>
        <p>{data.description}</p>
        <div className="flex items-center gap-2 mt-4">
          <div className="p-4 border rounded flex flex-col items-center">
            <span>{data.tasksTotal}</span>
            <span>Total Tasks</span>
          </div>
          <div className="p-4 border rounded flex flex-col items-center">
            <span className="bg-green-400">{data.tasksCompleted}</span>
            <span>Completed</span>
          </div>
        </div>
    </div>
  );
}