import "dotenv/config";

import {
  InMemoryTaskStore
} from "./stores/in-memory-task-store.js";

import {
  TaskService
} from "./services/task-service.js";


const appName =
  process.env.APP_NAME
  ?? "Task Management Core";


console.log(
  `Starting ${appName}`
);


const store =
  new InMemoryTaskStore();


const taskService =
  new TaskService(store);


const firstTask =
  await taskService.createTask({
    title:
      "Learn TypeScript and Node.js",

    description:
      "Complete Day 2 Stage 2",

    priority:
      "high"
  });


console.log(
  "Created:",
  firstTask
);

const retrievedTask =
  await taskService.getTask(
    firstTask.id
  );


console.log(
  "Retrieved:",
  retrievedTask
);

await taskService.createTask({
  title: "Practice DSA",
  priority: "high"
});


await taskService.createTask({
  title: "Read documentation",
  priority: "low"
});

const allTasks =
  await taskService.listTasks();


console.log(
  "All tasks:",
  allTasks
);

const highPriorityTasks =
  await taskService.listTasks({
    priority: "high"
  });


console.log(
  "High priority:",
  highPriorityTasks
);

const updatedTask =
  await taskService.updateTask(
    firstTask.id,
    {
      title:
        "Master TypeScript and Node.js",

      priority:
        "medium"
    }
  );


console.log(
  "Updated:",
  updatedTask
);

const inProgressTask =
  await taskService.changeTaskStatus(
    firstTask.id,
    "in_progress"
  );
console.log(inProgressTask);

const completedTask =
  await taskService.changeTaskStatus(
    firstTask.id,
    "done"
  );
console.log(completedTask);