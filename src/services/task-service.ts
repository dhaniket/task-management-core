import {
  randomUUID
} from "node:crypto";

import {
  InvalidTaskTransitionError,
  TaskNotFoundError,
  TaskValidationError
} from "../errors/task-errors.js";

import type {
  CreateTaskInput,
  Task,
  TaskFilter,
  TaskStatus,
  UpdateTaskInput
} from "../types/task.js";

import type {
  TaskStore
} from "../stores/task-store.js";

const ALLOWED_TRANSITIONS:
  Record<
    TaskStatus,
    readonly TaskStatus[]
  > = {

  todo: [
    "in_progress"
  ],

  in_progress: [
    "done"
  ],

  done: []
};

export class TaskService {

  constructor(
    private readonly store: TaskStore
  ) {}

  private validateText(
  value: string,
  fieldName: string
): string {

  const normalized =
    value.trim();


  if (normalized.length === 0) {
    throw new TaskValidationError(
      `${fieldName} cannot be empty`
    );
  }


  return normalized;
}

  async getTask(
    id: string
  ): Promise<Task | undefined> {
        return this.store.findById(id);
    }

  async createTask(
    input: CreateTaskInput
  ): Promise<Task> {

    const now = new Date();

    const task: Task = {
      id: randomUUID(),

      title:
        this.validateText(
          input.title,
          "title"
        ),

      ...(input.description !== undefined
        ? {
            description:
              this.validateText(
                input.description,
                "description"
              )
          }
        : {}),

      status: "todo",

      priority:
        input.priority ?? "medium",

      createdAt: now,

      updatedAt: now
    };


    return this.store.save(task);
  }

  async listTasks(
  filter: TaskFilter = {}
): Promise<Task[]> {

  const tasks =
    await this.store.findAll();


  return tasks.filter(
    (task) => {

      if (
        filter.status !== undefined
        &&
        task.status !== filter.status
      ) {
        return false;
      }


      if (
        filter.priority !== undefined
        &&
        task.priority !== filter.priority
      ) {
        return false;
      }


      return true;
    }
  );
}

async updateTask(
  id: string,
  input: UpdateTaskInput
): Promise<Task> {

  const task =
    await this.store.findById(id);


  if (task === undefined) {
    throw new TaskNotFoundError(
      id
    );
  }


  const updatedTask: Task = {
    ...task,

    ...(input.title !== undefined
      ? {
          title:
            this.validateText(
              input.title,
              "title"
            )
        }
      : {}),

    ...(input.description !== undefined
      ? {
          description:
            this.validateText(
              input.description,
              "description"
            )
        }
      : {}),

    ...(input.priority !== undefined
      ? {
          priority:
            input.priority
        }
      : {}),

    updatedAt: new Date()
  };


  return this.store.update(
    updatedTask
  );
}

async changeTaskStatus(
  id: string,
  nextStatus: TaskStatus
): Promise<Task> {

  const task =
    await this.store.findById(id);


  if (task === undefined) {
    throw new TaskNotFoundError(
      id
    );
  }


  if (task.status === nextStatus) {
    return task;
  }


  const allowed =
    ALLOWED_TRANSITIONS[
      task.status
    ];


  if (!allowed.includes(nextStatus)) {
    throw new InvalidTaskTransitionError(
      task.status,
      nextStatus
    );
  }


  const updatedTask: Task = {
    ...task,

    status: nextStatus,

    updatedAt: new Date()
  };


  return this.store.update(
    updatedTask
  );
}

async deleteTask(
  id: string
): Promise<void> {

  const deleted =
    await this.store.delete(id);


  if (!deleted) {
    throw new TaskNotFoundError(
      id
    );
  }
}

}