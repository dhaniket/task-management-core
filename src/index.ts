import type {
  CreateTaskInput,
  Task
} from "./types/task.js";

function createTask(
  input: CreateTaskInput
): Task {

  const now = new Date();

  return {
    id: crypto.randomUUID(),

    title: input.title,

    ...(input.description !== undefined
      ? { description: input.description }
      : {}),

    status: "todo",

    priority: input.priority ?? "medium",

    createdAt: now,

    updatedAt: now
  };
}


const task = createTask({
  title: "Learn TypeScript and Node.js",
  description: "Complete Day 2",
  priority: "high"
});

const tasks: Task[] = [];
tasks.push(task);

function getHighPriorityTasks(
  tasks: Task[]
): Task[] {

  return tasks.filter(
    (task) => task.priority === "high"
  );
}

import 'dotenv/config';

const appName =
  process.env.APP_NAME
  ?? "Task Management Core";


console.log(`Starting ${appName}`);