export interface Project {
    id: string;
    slug: string;
    name: string;
    description: string;
    color: string;
    status: string;
    tasksTotal: number;
    tasksCompleted: number;
    dueDate: string;
}