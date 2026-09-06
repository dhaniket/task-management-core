import type {
  TaskStatus
} from "../types/task.js";


export class TaskNotFoundError
  extends Error {

  constructor(
    public readonly taskId: string
  ) {
    super(
      `Task not found: ${taskId}`
    );

    this.name =
      "TaskNotFoundError";
  }
}


export class InvalidTaskTransitionError
  extends Error {

  constructor(
    public readonly from: TaskStatus,
    public readonly to: TaskStatus
  ) {
    super(
      `Invalid task transition: ` +
      `${from} -> ${to}`
    );

    this.name =
      "InvalidTaskTransitionError";
  }
}


export class TaskValidationError
  extends Error {

  constructor(
    message: string
  ) {
    super(message);

    this.name =
      "TaskValidationError";
  }
}