export type TaskStatus =
  | "todo"
  | "in_progress"
  | "done";


export type TaskPriority =
  | "low"
  | "medium"
  | "high";


export interface Task {
  readonly id: string;

  title: string;

  description?: string;

  status: TaskStatus;

  priority: TaskPriority;

  readonly createdAt: Date;

  updatedAt: Date;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: TaskPriority;
}