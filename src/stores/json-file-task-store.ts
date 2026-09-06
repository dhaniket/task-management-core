import {
  access,
  mkdir,
  readFile,
  rename,
  writeFile
} from "node:fs/promises";

import {
  dirname
} from "node:path";

import type {
  Task,
  TaskPriority,
  TaskStatus
} from "../types/task.js";

import type {
  TaskStore
} from "./task-store.js";

import {
  TaskStoreError
} from "../errors/task-store-error.js";

import {
  findById
} from "../utils/find-by-id.js";


interface StoredTask {
  id: string;

  title: string;

  description?: string;

  status: TaskStatus;

  priority: TaskPriority;

  createdAt: string;

  updatedAt: string;
}

export class JsonFileTaskStore
  implements TaskStore {

  constructor(
    private readonly filePath: string
  ) {}

  private isNodeError(
    error: unknown
    ): error is NodeJS.ErrnoException {

    return (
        error instanceof Error
        &&
        "code" in error
    );
    }

  private async ensureFile():
  Promise<void> {

  await mkdir(
    dirname(this.filePath),
    {
      recursive: true
    }
  );



  try {

    await access(
      this.filePath
    );

  } catch (error: unknown) {

    if (
      this.isNodeError(error)
      &&
      error.code === "ENOENT"
    ) {

      await writeFile(
        this.filePath,
        "[]",
        "utf8"
      );

      return;
    }


    throw new TaskStoreError(
      "Failed to access task data file",
      {
        cause: error
      }
    );
  }
}

  async save(
    task: Task
  ): Promise<Task> {

    const tasks =
      await this.readTasks();

    tasks.push(task);

    await this.writeTasks(
      tasks
    );

    return task;
  }


  async findById(
    id: string
  ): Promise<Task | undefined> {

    const tasks =
      await this.readTasks();

    return findById(
      tasks,
      id
    );
  }


  async findAll(): Promise<Task[]> {

    return this.readTasks();
  }


  async update(
    task: Task
  ): Promise<Task> {

    const tasks =
      await this.readTasks();


    const index =
      tasks.findIndex(
        (existing) =>
          existing.id === task.id
      );


    if (index === -1) {
      throw new TaskStoreError(
        `Cannot update missing task: ` +
        task.id
      );
    }


    tasks[index] = task;


    await this.writeTasks(
      tasks
    );


    return task;
  }

  private async readTasks():
  Promise<Task[]> {

  await this.ensureFile();


  let contents: string;


  try {

    contents =
      await readFile(
        this.filePath,
        "utf8"
      );

  } catch (error: unknown) {

    throw new TaskStoreError(
      "Failed to read task data",
      {
        cause: error
      }
    );
  }


  let parsed: unknown;


  try {

    parsed =
      JSON.parse(contents);

  } catch (error: unknown) {

    throw new TaskStoreError(
      "Task data contains invalid JSON",
      {
        cause: error
      }
    );
  }


  if (
    !Array.isArray(parsed)
  ) {

    throw new TaskStoreError(
      "Task data must be an array"
    );
  }


  if (
    !parsed.every(
      (value) =>
        this.isStoredTask(value)
    )
  ) {

    throw new TaskStoreError(
      "Task data contains invalid records"
    );
  }


  return parsed.map(
    (storedTask) =>
      this.fromStoredTask(
        storedTask
      )
  );
}
private isStoredTask(
  value: unknown
): value is StoredTask {

  if (
    typeof value !== "object"
    ||
    value === null
  ) {
    return false;
  }


  const record =
    value as Record<
      string,
      unknown
    >;


  return (
    typeof record.id
      === "string"
    &&
    typeof record.title
      === "string"
    &&
    (
      record.description === undefined
      ||
      typeof record.description
        === "string"
    )
    &&
    this.isTaskStatus(
      record.status
    )
    &&
    this.isTaskPriority(
      record.priority
    )
    &&
    typeof record.createdAt
      === "string"
    &&
    typeof record.updatedAt
      === "string"
  );
}
private isTaskStatus(
  value: unknown
): value is TaskStatus {

  return (
    value === "todo"
    ||
    value === "in_progress"
    ||
    value === "done"
  );
}
private isTaskPriority(
  value: unknown
): value is TaskPriority {

  return (
    value === "low"
    ||
    value === "medium"
    ||
    value === "high"
  );
}
private fromStoredTask(
  task: StoredTask
): Task {

  return {
    id: task.id,

    title: task.title,

    ...(task.description !== undefined
      ? {
          description:
            task.description
        }
      : {}),

    status: task.status,

    priority: task.priority,

    createdAt:
      new Date(task.createdAt),

    updatedAt:
      new Date(task.updatedAt)
  };
}
private toStoredTask(
  task: Task
): StoredTask {

  return {
    id: task.id,

    title: task.title,

    ...(task.description !== undefined
      ? {
          description:
            task.description
        }
      : {}),

    status: task.status,

    priority: task.priority,

    createdAt:
      task.createdAt.toISOString(),

    updatedAt:
      task.updatedAt.toISOString()
  };
}
private async writeTasks(
  tasks: readonly Task[]
): Promise<void> {

  await mkdir(
    dirname(this.filePath),
    {
      recursive: true
    }
  );


  const storedTasks =
    tasks.map(
      (task) =>
        this.toStoredTask(task)
    );


  const contents =
    JSON.stringify(
      storedTasks,
      null,
      2
    );


  const temporaryPath =
    `${this.filePath}.tmp`;


  try {

    await writeFile(
      temporaryPath,
      contents,
      "utf8"
    );


    await rename(
      temporaryPath,
      this.filePath
    );

  } catch (error: unknown) {

    throw new TaskStoreError(
      "Failed to write task data",
      {
        cause: error
      }
    );
  }
}

async delete(
  id: string
): Promise<boolean> {

  const tasks =
    await this.readTasks();


  const remainingTasks =
    tasks.filter(
      (task) =>
        task.id !== id
    );


  if (
    remainingTasks.length
    === tasks.length
  ) {
    return false;
  }


  await this.writeTasks(
    remainingTasks
  );


  return true;
}

}