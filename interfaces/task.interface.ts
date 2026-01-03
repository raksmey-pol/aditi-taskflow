export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  status: string;
  priority: string;
  dueDate: string;
  tags: string[];
  subtasks?: Array<{ id: string; title: string; completed: boolean }>;
  comments?: Array<{ id: string; author: "string"; content: string; createdAt: "string"}>
}