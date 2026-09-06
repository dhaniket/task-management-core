# Task Management Core

A strongly typed task-management core built with **TypeScript** and **Node.js** as part of a backend engineering preparation roadmap.

The project currently focuses on domain modelling, TypeScript fundamentals, Node.js runtime concepts, clean typing, and basic task creation logic. REST APIs, databases, and web frameworks are intentionally not included yet.

## Current Scope

Implemented so far:

- Strict TypeScript project setup
- Node.js runtime setup
- npm-based development workflow
- ES module configuration
- Task domain modelling
- Task status and priority union types
- Create/update input contracts
- Readonly and optional properties
- Typed task creation
- UUID generation
- Default task status and priority
- Type-safe arrays and filtering
- Environment-variable configuration with `dotenv`
- Type inference and narrowing fundamentals
- `unknown` vs `any`
- Type checking and TypeScript compilation

## Tech Stack

- TypeScript
- Node.js
- npm
- tsx
- Git

## Project Structure

```text
task-management-core/
├── src/
│   ├── index.ts
│   ├── types/
│   │   └── task.ts
│   └── services/
├── data/
├── .gitignore
├── package.json
├── package-lock.json
└── tsconfig.json
```

The `services/` and `data/` directories are reserved for functionality introduced in later stages.

## Domain Model

### Task Status

A task can currently have one of three statuses:

```typescript
type TaskStatus =
  | "todo"
  | "in_progress"
  | "done";
```

Using a union instead of a general `string` prevents unsupported task states from being represented accidentally.

### Task Priority

```typescript
type TaskPriority =
  | "low"
  | "medium"
  | "high";
```

### Task

```typescript
interface Task {
  readonly id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  readonly createdAt: Date;
  updatedAt: Date;
}
```

The `id` and `createdAt` properties are readonly because they represent identity and creation metadata that should not be modified after a task is created.

### Create Task Input

```typescript
interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
}
```

Creation input is intentionally separate from the stored `Task` model.

The application generates or controls:

- `id`
- `status`
- `createdAt`
- `updatedAt`

If no priority is provided, the application defaults it to `medium`.

New tasks start with the `todo` status.

### Update Task Input

```typescript
interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: TaskPriority;
}
```

Status changes are intentionally excluded from the generic update model so that task-status transitions can later be handled as explicit business behaviour.

## Task Creation

Tasks are created through typed application logic.

Example:

```typescript
const task = createTask({
  title: "Learn TypeScript and Node.js",
  description: "Complete Day 2",
  priority: "high"
});
```

The application generates values such as:

```text
id        → UUID
status    → todo
priority  → supplied value or medium
createdAt → current timestamp
updatedAt → current timestamp
```

## TypeScript Configuration

The project uses strict compiler settings.

Important options include:

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true,
  "noImplicitReturns": true
}
```

These settings help expose unsafe assumptions during development rather than at runtime.

## Development Setup

### Prerequisites

Install:

- Node.js
- npm
- Git

Verify:

```bash
node --version
npm --version
git --version
```

### Install Dependencies

```bash
npm install
```

## Available Commands

### Development

```bash
npm run dev
```

Runs the TypeScript entry point using `tsx`.

### Type Check

```bash
npm run typecheck
```

Runs the TypeScript compiler without emitting JavaScript.

### Build

```bash
npm run build
```

Compiles TypeScript from `src/` into JavaScript under `dist/`.

### Run Compiled Application

```bash
npm start
```

Runs the compiled JavaScript using Node.js.

## Environment Variables

The project uses **dotenv** to load environment-specific configuration from a local `.env` file.

Install it with:

```bash
npm install dotenv
```

Create a local `.env` file in the project root:

```env
APP_NAME=Task Management Core
```

The `.env` file is excluded from Git through `.gitignore` because environment files may eventually contain secrets or machine-specific configuration.

Load the variables in the application with:

```typescript
import "dotenv/config";
```

Then access them through Node.js:

```typescript
const appName =
  process.env.APP_NAME ??
  "Task Management Core";

console.log(`Starting ${appName}`);
```

The flow is:

```text
.env
 ↓
dotenv
 ↓
process.env
 ↓
application configuration
```

`dotenv` does not replace `process.env`; it loads values from the `.env` file into Node.js's environment-variable interface.

Environment-specific values such as these should not be hard-coded into source code:

```text
DATABASE_URL
REDIS_URL
PORT
API_KEY
NODE_ENV
```

For the current Stage 1 project, `APP_NAME` is enough to demonstrate the pattern.

## Type Safety Principles Used

### Prefer Domain-Specific Types

Instead of:

```typescript
status: string
```

the project uses:

```typescript
status: TaskStatus
```

This makes invalid states harder to represent.

### Prefer `unknown` Over `any`

`any` disables much of TypeScript's protection.

For genuinely unknown data, prefer `unknown` and narrow the type before using it.

Example:

```typescript
function printValue(value: unknown): void {
  if (typeof value === "string") {
    console.log(value.toUpperCase());
  }
}
```

### Use Type Inference Where Appropriate

TypeScript can infer callback values from typed collections.

```typescript
function getHighPriorityTasks(
  tasks: Task[]
): Task[] {
  return tasks.filter(
    (task) => task.priority === "high"
  );
}
```

The callback parameter is inferred as `Task`.

## Current Architecture

At the current stage:

```text
TypeScript Domain Types
        ↓
Application Functions
        ↓
Node.js Runtime
```

The project does not yet contain HTTP or database layers.

That separation is deliberate so TypeScript and Node.js fundamentals can be learned before REST/API design and persistence are introduced.

## Planned Next Stage

The next stage will introduce:

- Task service layer
- Node.js module organization
- Task lookup/update operations
- Explicit task-status transitions
- Business rules
- Type narrowing in application logic
- Generics
- Structured error handling

These are planned features and are not claimed as implemented yet.

## Learning Goals

This project is being used to understand:

- TypeScript's relationship with JavaScript
- TypeScript's relationship with Node.js
- Static typing vs runtime behaviour
- Interfaces and type aliases
- Union types
- Optional properties
- Readonly properties
- Type inference
- Type narrowing
- `unknown` vs `any`
- npm and package management basics
- ES modules
- Node.js environment variables with `dotenv`
- TypeScript compilation
- Basic domain modelling

## Git

Generated directories such as the following should not be committed:

```text
node_modules/
dist/
```

A suitable `.gitignore` includes:

```gitignore
node_modules/
dist/
.env
*.log
```

A suitable first commit for this stage is:

```bash
git add .
git commit -m "chore: initialize TypeScript Node task core"
```

## Status

**Day 2 — TypeScript + Node.js**

Stage 1 foundation implemented / in progress.

The project will continue to evolve through the remaining Day 2 stages without adding REST APIs or databases prematurely.
