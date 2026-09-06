import type {
  Task
} from "../types/task.js";


export interface TaskStore {

  save(
    task: Task
  ): Promise<Task>;

  findById(
    id: string
  ): Promise<Task | undefined>;

  findAll(): Promise<Task[]>;

  update(
    task: Task
  ): Promise<Task>;
}