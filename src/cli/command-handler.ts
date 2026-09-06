import type {
  TaskPriority
} from "../types/task.js";

import type {
  TaskService
} from "../services/task-service.js";


type Command =
  | {
      type: "help";
    }
  | {
      type: "list";
    }
  | {
      type: "create";
      title: string;
      priority?: TaskPriority;
    }
  | {
      type: "start";
      id: string;
    }
  | {
      type: "complete";
      id: string;
    }
  | {
      type: "delete";
      id: string;
    };


function parsePriority(
  value: string | undefined
): TaskPriority | undefined {

  if (value === undefined) {
    return undefined;
  }

  if (
    value === "low"
    ||
    value === "medium"
    ||
    value === "high"
  ) {
    return value;
  }

  throw new Error(
    `Invalid priority: ${value}`
  );
}


function parseCommand(
  args: string[]
): Command {

  if (args.length === 0) {
    return {
      type: "help"
    };
  }


  const [
    command,
    first,
    second
  ] = args;


  switch (command) {

    case "help":
      return {
        type: "help"
      };


    case "list":
      return {
        type: "list"
      };


    case "create": {

      if (!first) {
        throw new Error(
          "Task title is required"
        );
      }


      const priority =
        parsePriority(second);


      return {
        type: "create",
        title: first,

        ...(priority !== undefined
          ? {
              priority
            }
          : {})
      };
    }


    case "start": {

      if (!first) {
        throw new Error(
          "Task ID is required"
        );
      }


      return {
        type: "start",
        id: first
      };
    }


    case "complete": {

      if (!first) {
        throw new Error(
          "Task ID is required"
        );
      }


      return {
        type: "complete",
        id: first
      };
    }


    case "delete": {

      if (!first) {
        throw new Error(
          "Task ID is required"
        );
      }


      return {
        type: "delete",
        id: first
      };
    }


    default:
      throw new Error(
        `Unknown command: ${command}`
      );
  }
}


function printHelp():
  void {

  console.log(`
Task Management Core

Usage:

  npm run dev -- <command>

Commands:

  help
      Show this help message.

  list
      List all tasks.

  create "<title>" [priority]
      Create a new task.

  start <task-id>
      Move a task from todo to in_progress.

  complete <task-id>
      Move a task from in_progress to done.

  delete <task-id>
      Delete a task.

Priorities:

  low
  medium
  high

Examples:

  npm run dev -- list

  npm run dev -- create "Learn TypeScript"

  npm run dev -- create "Learn Node.js" high

  npm run dev -- start <task-id>

  npm run dev -- complete <task-id>

  npm run dev -- delete <task-id>
`);
}


function assertNever(
  value: never
): never {

  throw new Error(
    `Unhandled command: ${JSON.stringify(value)}`
  );
}


export async function handleCommand(
  service: TaskService,
  args: string[]
): Promise<void> {

  const command =
    parseCommand(args);


  switch (command.type) {

    case "help": {

      printHelp();

      return;
    }


    case "list": {

      const tasks =
        await service.listTasks();


      if (tasks.length === 0) {

        console.log(
          "No tasks found."
        );

        return;
      }


      for (const task of tasks) {

        console.log(
          [
            task.id,
            `[${task.status}]`,
            `[${task.priority}]`,
            task.title
          ].join(" ")
        );
      }


      return;
    }


    case "create": {

      const task =
        await service.createTask({
          title: command.title,

          ...(command.priority !== undefined
            ? {
                priority:
                  command.priority
              }
            : {})
        });


      console.log(
        `Created task: ${task.id}`
      );

      console.log(
        `${task.title} [${task.priority}]`
      );


      return;
    }


    case "start": {

      const task =
        await service.changeTaskStatus(
          command.id,
          "in_progress"
        );


      console.log(
        `Started task: ${task.title}`
      );


      return;
    }


    case "complete": {

      const task =
        await service.changeTaskStatus(
          command.id,
          "done"
        );


      console.log(
        `Completed task: ${task.title}`
      );


      return;
    }


    case "delete": {

      await service.deleteTask(
        command.id
      );


      console.log(
        `Deleted task: ${command.id}`
      );


      return;
    }


    default:
      return assertNever(
        command
      );
  }
}