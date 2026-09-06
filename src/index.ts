import "dotenv/config";

import {
  resolve
} from "node:path";

import {
  handleCommand
} from "./cli/command-handler.js";

import {
  TaskService
} from "./services/task-service.js";

import {
  JsonFileTaskStore
} from "./stores/json-file-task-store.js";

import {
  InvalidTaskTransitionError,
  TaskNotFoundError,
  TaskValidationError
} from "./errors/task-errors.js";

import {
  TaskStoreError
} from "./errors/task-store-error.js";


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


const service =
  new TaskService(
    store
  );

async function main():
  Promise<void> {

  const args =
    process.argv.slice(2);


  await handleCommand(
    service,
    args
  );
}

try {

  await main();

} catch (error: unknown) {

  if (
    error instanceof TaskNotFoundError
  ) {

    console.error(
      error.message
    );

  } else if (
    error instanceof
      InvalidTaskTransitionError
  ) {

    console.error(
      error.message
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
      "Storage error:",
      error.message
    );

  } else if (
    error instanceof Error
  ) {

    console.error(
      error.message
    );

  } else {

    console.error(
      "Unknown error"
    );
  }


  process.exitCode = 1;
}

