import "dotenv/config";
import {
  InvalidTaskTransitionError,
  TaskNotFoundError,
  TaskValidationError
} from "./errors/task-errors.js";

import {
  TaskStoreError
} from "./errors/task-store-error.js";
import {
  JsonFileTaskStore
} from "./stores/json-file-task-store.js";

import {
  resolve
} from "node:path";

import {
  TaskService
} from "./services/task-service.js";


const appName =
  process.env.APP_NAME
  ?? "Task Management Core";


console.log(
  `Starting ${appName}`
);



const dataFile =
  resolve(
    process.cwd(),
    process.env.TASK_DATA_FILE
      ?? "data/tasks.json"
  );


const store =
  new JsonFileTaskStore(
    dataFile
  );


const taskService =
  new TaskService(store);

async function main():
  Promise<void> {

  const tasks =
    await taskService.listTasks();

  console.log(
    "Tasks:",
    tasks
  );
}


try {

  await main();

} catch (error: unknown) {

  if (
    error instanceof TaskNotFoundError
  ) {

    console.error(
      `Task ${error.taskId} does not exist`
    );

  } else if (
    error instanceof
      InvalidTaskTransitionError
  ) {

    console.error(
      `Cannot change task from ` +
      `${error.from} to ${error.to}`
    );

  } else if (
    error instanceof
      TaskValidationError
  ) {

    console.error(
      error.message
    );

  } else if (
    error instanceof TaskStoreError
  ) {

    console.error(
      "Task storage failure:",
      error.message
    );

  } else if (
    error instanceof Error
  ) {

    console.error(
      "Unexpected error:",
      error.message
    );

  } else {

    console.error(
      "Unknown failure:",
      error
    );
  }


  process.exitCode = 1;
}

