"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  status: string;
  priority: string;
  dueDate: string;
  tags: string[];
  subtasks?: Array<{ id: string; title: string; completed: boolean }>;
}

export default function TasksList() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("/api/tasks");
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div className="grid place-items-center h-screen">
        <Spinner className="size-16" />
      </div>
    );
  }

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
          <Input className="w-50 pl-10" placeholder="Search tasks..."></Input>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {tasks.length === 0 ? (
          <p className="text-muted-foreground">No tasks found</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="p-4 border rounded-lg">
              <h3 className="font-semibold">{task.title}</h3>
              <p className="text-sm text-muted-foreground">
                {task.description}
              </p>
              <div className="mt-2 flex gap-2">
                <span className="text-xs px-2 py-1 rounded bg-secondary">
                  {task.status}
                </span>
                <span className="text-xs px-2 py-1 rounded bg-secondary">
                  {task.priority}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
