"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Calendar, Flag, MessageSquare, Paperclip, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Task } from "../interfaces/task.interface";
import { Project } from "../interfaces/project.interface";
import formattedDate from "../utils/date.util";

export default function TasksList() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

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

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects");
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleCheckboxChange = async (
    taskId: string,
    currentStatus: string
  ) => {
    const newStatus = currentStatus === "done" ? "todo" : "done";

    // Optimistic update
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );

    try {
      const response = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      // Revert on error
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: currentStatus } : task
        )
      );
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center h-screen">
        <Spinner className="size-16" />
      </div>
    );
  }

  const renderBadge = (status: string) => {
    if (status === "in-progress")
      return (
        <Badge className="bg-amber-500/20 text-amber-600 rounded-md border-amber-600">
          In Progress
        </Badge>
      );
    if (status === "done")
      return (
        <Badge className="bg-green-500/20  text-green-600 rounded-md border-green-600">
          Done
        </Badge>
      );
    if (status === "todo")
      return (
        <Badge className="bg-gray-200/20  text-gray-900 rounded-md border-gray-600">
          To Do
        </Badge>
      );

    return <Badge>Status</Badge>;
  };

  const isDone = (status: string): boolean => {
    if (status === "done") {
      return true;
    }
    return false;
  };

  const projectName = (projectId: string): string => {
    const project = projects.find((p => p.id === projectId));
    return project ? project.name : "Project not found";
  };

  const renderPriorityFlag = (priority: string) => {
    if (priority === "high") return <Flag className="text-red-600"/>
    if (priority === "medium") return <Flag className="text-amber-600"/>
    if (priority === "low") return <Flag className="text-blue-500"/>

    return <Flag />
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
              <div className="flex items-center justify-between">
                <div className="flex gap-4 items-center">
                  <div>
                    <Checkbox
                      checked={isDone(task.status)}
                      onCheckedChange={() =>
                        handleCheckboxChange(task.id, task.status)
                      }
                    />
                  </div>
                  <div>
                    <div className="flex gap-3">
                      <h3
                        className={cn(
                          "font-semibold",
                          task.status === "done"
                            ? "font-semibold line-through opacity-50"
                            : ""
                        )}
                      >
                        {task.title}
                      </h3>
                      {renderBadge(task.status)}
                    </div>
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
                </div>
                <div className="flex gap-3">
                  <div>
                    <h4 className="text-xs border-2 py-1 px-2 rounded-md border-gray-100 bg-gray-100/50 text-gray-600">{projectName(task.projectId)}</h4>
                  </div>
                  <div className="flex gap-1">
                    <MessageSquare className="text-gray-500"/>
                    <h4 className="text-[1rem]">{task.comments?.length}</h4>
                  </div>
                  <div className="flex gap-1">
                    <Paperclip className="text-gray-500"/>
                    <h4>0</h4>
                  </div>
                  <div className="">
                    {renderPriorityFlag(task.priority)}
                  </div>
                  <div className="flex gap-1">
                    <Calendar className="text-gray-500"/>
                    <h4 className="text-[1rem]">{formattedDate(task.dueDate)}</h4>
                  </div>
                  <div>
                    <h4>JD</h4>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
