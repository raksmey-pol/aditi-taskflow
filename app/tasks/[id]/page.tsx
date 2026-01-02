import tasks from "../../db/tasks.json";

export default async function TaskById({ params }: { params: { id: string } }) {
  
  const param = await params;
  const task = tasks.find((task) => task.id === Number(param.id));
  if (!task) return <h1>Task not found</h1>;

  return <h1>Hello {task.title}</h1>;
}
