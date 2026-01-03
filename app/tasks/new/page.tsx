import { TaskForm } from "@/components/task-form";

export default function NewTaskPage() {
  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">New Task</h1>
      <TaskForm />
    </div>
  );
}
