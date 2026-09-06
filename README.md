# Task Management Core

A strongly typed **TypeScript + Node.js** task-management application built as part of a backend engineering preparation roadmap.

The project focuses on clean domain modelling, strict TypeScript, Node.js runtime features, business-rule enforcement, dependency injection, persistent JSON storage, runtime validation, typed error handling, and CLI interaction.

> This project intentionally does **not** include REST APIs, Express, PostgreSQL, Redis, Docker, or other later-stage technologies.

---

## Features

- Create tasks
- List all tasks
- Start tasks
- Complete tasks
- Delete tasks
- Task priority support
- Controlled task-status transitions
- UUID-based task IDs
- Persistent JSON-file storage
- Automatic task-data file creation
- Runtime validation of persisted JSON
- Safe Date serialization/deserialization
- Typed domain errors
- Storage-specific errors
- Environment configuration with `dotenv`
- CLI command parsing
- Strict TypeScript configuration
- Generic utility functions
- Dependency injection
- In-memory and JSON-backed store implementations
- Safer temporary-file replacement when persisting data

---

## Tech Stack

- TypeScript
- Node.js
- npm
- tsx
- dotenv
- Node.js `fs/promises`
- Node.js `crypto`
- Node.js `path`
- Git

---

## Architecture

```text
CLI / process.argv
        │
        ▼
     index.ts
        │
        ▼
   TaskService
        │
        ▼
 TaskStore interface
    ▲         ▲
    │         │
InMemory   JsonFile
 TaskStore  TaskStore
               │
               ▼
        data/tasks.json
```

### Responsibilities

#### CLI Layer
Parses terminal commands and converts them into application operations.

#### TaskService
Contains task-related business rules such as:

- default task priority
- default task status
- input normalization
- task updates
- valid task-status transitions
- missing-task handling

#### TaskStore
Defines the persistence contract used by `TaskService`.

#### InMemoryTaskStore
Stores tasks in memory.

Useful for simple development and future testing.

#### JsonFileTaskStore
Persists tasks to a JSON file using asynchronous Node.js filesystem APIs.

---

## Project Structure

```text
task-management-core/
├── src/
│   ├── index.ts
│   │
│   ├── cli/
│   │   └── command-handler.ts
│   │
│   ├── errors/
│   │   ├── task-errors.ts
│   │   └── task-store-error.ts
│   │
│   ├── services/
│   │   └── task-service.ts
│   │
│   ├── stores/
│   │   ├── task-store.ts
│   │   ├── in-memory-task-store.ts
│   │   └── json-file-task-store.ts
│   │
│   ├── types/
│   │   └── task.ts
│   │
│   └── utils/
│       └── find-by-id.ts
│
├── data/
│   └── .gitkeep
│
├── .env
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
└── tsconfig.json
```

---

## Domain Model

### Task Status

```typescript
export type TaskStatus =
  | "todo"
  | "in_progress"
  | "done";
```

The application only allows these transitions:

```text
todo
  ↓
in_progress
  ↓
done
```

Direct transitions such as:

```text
todo → done
```

are rejected by business logic.

---

## Task Priority

```typescript
export type TaskPriority =
  | "low"
  | "medium"
  | "high";
```

If no priority is supplied when creating a task, the application defaults to:

```text
medium
```

---

## Task

```typescript
export interface Task {
  readonly id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  readonly createdAt: Date;
  updatedAt: Date;
}
```

`id` and `createdAt` are readonly because they represent task identity and creation metadata.

---

## Create Task Input

```typescript
export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
}
```

The caller does not provide:

- `id`
- `status`
- `createdAt`
- `updatedAt`

Those values are controlled by the application.

---

## Update Task Input

```typescript
export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: TaskPriority;
}
```

Status is intentionally excluded from generic updates.

Status changes go through explicit business rules.

---

## Generic Utility

The project includes a generic lookup helper:

```typescript
interface Identifiable {
  readonly id: string;
}

export function findById<
  T extends Identifiable
>(
  items: readonly T[],
  id: string
): T | undefined {
  return items.find(
    (item) => item.id === id
  );
}
```

This works with any type that contains:

```typescript
id: string
```

while preserving its actual return type.

---

## Task Store Abstraction

```typescript
export interface TaskStore {
  save(
    task: Task
  ): Promise<Task>;

  findById(
    id: string
  ): Promise<Task | undefined>;

  findAll():
    Promise<Task[]>;

  update(
    task: Task
  ): Promise<Task>;

  delete(
    id: string
  ): Promise<boolean>;
}
```

`TaskService` depends on this interface rather than a specific storage implementation.

That allows:

```typescript
new TaskService(
  new InMemoryTaskStore()
);
```

or:

```typescript
new TaskService(
  new JsonFileTaskStore(filePath)
);
```

without rewriting the business logic.

---

## Dependency Injection

The project uses constructor injection:

```typescript
const store =
  new JsonFileTaskStore(
    dataFile
  );

const service =
  new TaskService(
    store
  );
```

`TaskService` does not create its own store.

This keeps business logic independent from persistence details.

---

## Persistent JSON Storage

The JSON-backed store uses:

```typescript
node:fs/promises
```

for asynchronous filesystem operations.

Tasks are persisted to:

```text
data/tasks.json
```

Runtime data is excluded from Git.

---

## Domain vs Persistence Representation

The domain model uses:

```typescript
createdAt: Date;
updatedAt: Date;
```

JSON stores dates as strings.

Therefore the file store uses a persistence model conceptually like:

```typescript
interface StoredTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
}
```

When writing:

```text
Task
 ↓
Date.toISOString()
 ↓
StoredTask
 ↓
JSON
```

When reading:

```text
JSON
 ↓
runtime validation
 ↓
StoredTask
 ↓
new Date(...)
 ↓
Task
```

---

## Runtime Validation

TypeScript only protects values known during development.

It cannot guarantee that external runtime data is valid.

Examples of external boundaries include:

- JSON files
- HTTP requests
- databases
- environment variables
- third-party APIs

For persisted JSON, the project follows:

```text
External JSON
     ↓
unknown
     ↓
runtime validation
     ↓
trusted typed data
```

The project uses user-defined type guards such as:

```typescript
value is StoredTask
```

to safely narrow `unknown` values.

---

## Empty JSON File Handling

If `tasks.json` exists but is empty, the application treats it as an empty task collection and can repair it to:

```json
[]
```

This prevents:

```text
Unexpected end of JSON input
```

from crashing normal first-run usage.

---

## Safer File Writes

Instead of overwriting the main JSON file directly, the project writes to a temporary file first:

```text
tasks.json.tmp
      ↓
rename
      ↓
tasks.json
```

This reduces the chance of leaving the main file partially written if something goes wrong during persistence.

It is still a learning-oriented persistence approach and is not a substitute for a transactional database.

---

## Typed Errors

### Domain Errors

Examples include:

```typescript
TaskNotFoundError
InvalidTaskTransitionError
TaskValidationError
```

These represent application/business failures.

### Storage Error

```typescript
TaskStoreError
```

represents infrastructure failures such as:

- unreadable files
- malformed JSON
- invalid persisted records
- write failures

This separation keeps business errors distinct from persistence errors.

---

## Environment Variables

The project uses **dotenv**.

Install:

```bash
npm install dotenv
```

Create:

```text
.env
```

Example:

```env
APP_NAME=Task Management Core
TASK_DATA_FILE=data/tasks.json
```

Load it using:

```typescript
import "dotenv/config";
```

Then access values through:

```typescript
process.env
```

Example:

```typescript
const appName =
  process.env.APP_NAME
  ?? "Task Management Core";
```

The `.env` file is excluded from Git.

---

## Installation

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

Install dependencies:

```bash
npm install
```

---

## Available Scripts

### Development

```bash
npm run dev
```

Runs the TypeScript application using `tsx`.

### Type Checking

```bash
npm run typecheck
```

Runs TypeScript static checking without generating JavaScript.

### Build

```bash
npm run build
```

Compiles:

```text
src/*.ts
```

into:

```text
dist/*.js
```

### Run Compiled Application

```bash
npm start
```

Runs the compiled application with Node.js.

---

## CLI Usage

Show help:

```bash
npm run dev -- help
```

List tasks:

```bash
npm run dev -- list
```

Create a task:

```bash
npm run dev -- create "Learn TypeScript"
```

Create a high-priority task:

```bash
npm run dev -- create "Learn Node.js" high
```

Start a task:

```bash
npm run dev -- start <task-id>
```

Complete a task:

```bash
npm run dev -- complete <task-id>
```

Delete a task:

```bash
npm run dev -- delete <task-id>
```

---

## Example Workflow

Create:

```bash
npm run dev -- create "Learn TypeScript" high
```

Example:

```text
Created task: 8ab833df-b083-47bb-aefa-7e687d09c48f
Learn TypeScript [high]
```

List:

```bash
npm run dev -- list
```

Example:

```text
8ab833df-b083-47bb-aefa-7e687d09c48f [todo] [high] Learn TypeScript
```

Start:

```bash
npm run dev -- start 8ab833df-b083-47bb-aefa-7e687d09c48f
```

Complete:

```bash
npm run dev -- complete 8ab833df-b083-47bb-aefa-7e687d09c48f
```

Delete:

```bash
npm run dev -- delete 8ab833df-b083-47bb-aefa-7e687d09c48f
```

---

## TypeScript Concepts Practised

- Primitive types
- Type inference
- Type aliases
- Interfaces
- Union types
- Optional properties
- `readonly`
- Arrays
- Function typing
- `unknown`
- `any`
- Type narrowing
- User-defined type guards
- Generics
- Generic constraints
- `Record<K, V>`
- `Promise<T>`
- `async` / `await`
- Discriminated unions
- `never`
- Exhaustive switch checking
- ES modules

---

## Node.js Concepts Practised

- Node.js runtime
- npm
- `package.json`
- ES modules
- `node:crypto`
- `node:path`
- `node:fs/promises`
- `process.env`
- `process.argv`
- `process.cwd()`
- `process.exitCode`
- Environment variables
- dotenv
- Asynchronous filesystem operations
- JSON serialization/deserialization
- CLI applications
- Runtime persistence

---

## Strict TypeScript Configuration

The project uses strict compiler settings such as:

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true,
  "noImplicitReturns": true
}
```

These settings intentionally surface unsafe assumptions during development.

---

## TypeScript vs Runtime Validation

TypeScript can reject:

```typescript
const priority:
  TaskPriority = "urgent";
```

during development.

But a user can still type:

```text
urgent
```

into the CLI.

Therefore external input must still be validated at runtime.

This distinction is fundamental to backend engineering:

```text
Compile-time types
        ≠
Runtime validation
```

---

## Business Rules vs Type Rules

TypeScript can ensure:

```text
"done"
```

is a valid `TaskStatus`.

It cannot automatically know whether this transition is valid:

```text
todo → done
```

That requires runtime business logic.

The project therefore separates:

```text
Type safety
    ↓
Is the value structurally valid?

Business logic
    ↓
Is this operation allowed?
```

---

## Current Persistence Limitations

The JSON implementation currently:

```text
reads entire file
      ↓
modifies task array
      ↓
writes entire file
```

This is suitable for a small learning project.

It is not designed for:

- millions of tasks
- high concurrency
- multiple writers
- transactions
- advanced querying
- production-scale durability

A proper database such as PostgreSQL will address those concerns in a later project/day.

---

## Git Ignore

Recommended:

```gitignore
node_modules/
dist/
.env
*.log

data/*.json
data/*.tmp
```

To preserve the empty data directory:

```text
data/.gitkeep
```

may be committed.

---

## Suggested Git History

Example progression:

```text
docs: finalize TypeScript Node project documentation

feat: add task management CLI

feat: add persistent JSON task store

refactor: add typed task domain errors

feat: add typed task service and status workflow

chore: initialize TypeScript Node task core
```

---

## Project Status

### Day 2 — TypeScript + Node.js ✅

Completed areas:

- TypeScript fundamentals
- Node.js fundamentals
- Typed domain modelling
- Service-layer business logic
- Storage abstraction
- Dependency injection
- In-memory storage
- Persistent JSON storage
- Async filesystem operations
- Runtime validation
- Typed errors
- CLI interaction
- Environment configuration
- Git workflow

The project is intentionally complete at this scope.

REST/API design, relational databases, caching, messaging, containers, cloud infrastructure, and AI functionality belong to later stages of the roadmap.
