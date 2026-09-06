import type {
  Task
} from "../types/task.js";

import type {
  TaskStore
} from "./task-store.js";

import {
  findById
} from "../utils/find-by-id.js";


export class InMemoryTaskStore
  implements TaskStore {

  private readonly tasks: Task[] = [];


  async save(
    task: Task
  ): Promise<Task> {

    this.tasks.push(task);

    return task;
  }


  async findById(
    id: string
  ): Promise<Task | undefined> {

    return findById(
      this.tasks,
      id
    );
  }


  async findAll(): Promise<Task[]> {

    return [...this.tasks];
  }


  async update(
    task: Task
  ): Promise<Task> {

    const index =
      this.tasks.findIndex(
        (item) => item.id === task.id
      );

    if (index === -1) {
      throw new Error(
        "Task does not exist"
      );
    }

    this.tasks[index] = task;

    return task;
  }

  async delete(
  id: string
): Promise<boolean> {

  const index =
    this.tasks.findIndex(
      (task) => task.id === id
    );


  if (index === -1) {
    return false;
  }


  this.tasks.splice(
    index,
    1
  );


  return true;
  }

}