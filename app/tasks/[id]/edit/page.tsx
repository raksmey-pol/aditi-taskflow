import { TaskForm } from "@/components/task-form";
import { ErrorState } from "@/components/error-state";

export default async function EditTaskPage({
  params,
}: {
  params: { id: string };
}) {
  const param = await params;
  const taskId = param.id;

  if (!taskId) {
    return <ErrorState title="Invalid Task" message="Task ID is missing." />;
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Edit Task</h1>
      <TaskForm taskId={taskId} />
    </div>
  );
}
