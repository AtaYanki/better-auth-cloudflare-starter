# Architecture Patterns Guide

This document explains the architectural patterns used in this starter template and how to extend them.

## Table of Contents

1. [Repository Pattern](#repository-pattern)
2. [Service Layer Pattern](#service-layer-pattern)
3. [Service Locator Pattern](#service-locator-pattern)
4. [Bucket Service](#bucket-service)
5. [Creating New Features](#creating-new-features)

---

## Repository Pattern

The **Repository Pattern** abstracts data access logic, providing a clean interface for database operations.

### Location

Repositories are located in `packages/db/src/repositories/`

### Structure

```typescript
// packages/db/src/repositories/example-repository.ts
import { eq, and } from "drizzle-orm";
import { db } from "../index";
import { example, type Example, type NewExample } from "../schema/example";

export class ExampleRepository {
  async create(data: NewExample): Promise<Example> {
    const [newItem] = await db.insert(example).values(data).returning();
    if (!newItem) {
      throw new Error("Failed to create example");
    }
    return newItem;
  }

  async findById(id: string, userId: string): Promise<Example | null> {
    const [found] = await db
      .select()
      .from(example)
      .where(and(eq(example.id, id), eq(example.userId, userId)))
      .limit(1);
    return found || null;
  }

  async findByUserId(userId: string): Promise<Example[]> {
    return db
      .select()
      .from(example)
      .where(eq(example.userId, userId))
      .orderBy(desc(example.createdAt));
  }

  async update(
    id: string,
    userId: string,
    data: Partial<Omit<NewExample, "id" | "userId" | "createdAt">>
  ): Promise<Example | null> {
    const [updated] = await db
      .update(example)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(example.id, id), eq(example.userId, userId)))
      .returning();
    return updated || null;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(example)
      .where(and(eq(example.id, id), eq(example.userId, userId)))
      .returning();
    return result.length > 0;
  }
}
```

### Key Principles

1. **Single Responsibility**: Each repository handles one entity type
2. **No Business Logic**: Repositories only perform CRUD operations
3. **Type Safety**: Use Drizzle ORM types (`$inferSelect`, `$inferInsert`)
4. **User Isolation**: Always filter by `userId` for user-scoped data

### Registering Repositories

Add your repository to `packages/db/src/repositories/index.ts`:

```typescript
export * from "./example-repository";
import { ExampleRepository } from "./example-repository";

export type Repositories = {
  todos: TodoRepository;
  examples: ExampleRepository; // Add your repository here
};

export const createRepositories = (): Repositories => {
  return {
    todos: new TodoRepository(),
    examples: new ExampleRepository(), // Instantiate here
  };
};
```

---

## Service Layer Pattern

The **Service Layer** contains business logic, validation, and tier-based limits.

### Location

Services are located in `packages/api/src/services/`

### Structure

```typescript
// packages/api/src/services/example-service.ts
import { TRPCError } from "@trpc/server";
import type { Context } from "../context";
import type { ExampleRepository } from "@better-auth-cloudflare-starter/db/repositories";
import { POLAR_PRODUCTS } from "@better-auth-cloudflare-starter/auth/lib/polar-products";

// Define tier limits
const TIER_LIMITS = {
  free: {
    maxExamples: 5,
  },
  pro: {
    maxExamples: Infinity,
  },
} as const;

export class ExampleService {
  constructor(private readonly exampleRepository: ExampleRepository) {}

  // Check tier limits before operations
  private async checkLimit(userId: string, context: Context): Promise<void> {
    const totalCount = await this.exampleRepository.getTotalCount(userId);
    const tier = await this.getUserTier(context);
    const limit = TIER_LIMITS[tier].maxExamples;

    if (totalCount >= limit) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `You've reached your ${tier} plan limit of ${limit} examples.`,
      });
    }
  }

  // Determine user tier from subscription
  private async getUserTier(context: Context): Promise<"free" | "pro"> {
    const customerState = context.customerState;
    if (
      customerState?.activeSubscriptions.some(
        (subscription) => subscription.productId === POLAR_PRODUCTS.pro.id
      )
    ) {
      return "pro";
    }
    return "free";
  }

  // Business logic methods
  async create(
    userId: string,
    data: { name: string; description?: string },
    context: Context
  ) {
    await this.checkLimit(userId, context);

    return this.exampleRepository.create({
      id: crypto.randomUUID(),
      userId,
      name: data.name,
      description: data.description || null,
    });
  }

  async list(userId: string) {
    return this.exampleRepository.findByUserId(userId);
  }

  async get(id: string, userId: string) {
    const found = await this.exampleRepository.findById(id, userId);
    if (!found) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Example not found",
      });
    }
    return found;
  }

  async update(
    id: string,
    userId: string,
    data: { name?: string; description?: string }
  ) {
    const updated = await this.exampleRepository.update(id, userId, data);
    if (!updated) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Example not found",
      });
    }
    return updated;
  }

  async delete(id: string, userId: string) {
    const deleted = await this.exampleRepository.delete(id, userId);
    if (!deleted) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Example not found",
      });
    }
    return { success: true };
  }
}
```

### Key Principles

1. **Business Logic**: Contains validation, tier checks, and business rules
2. **Dependency Injection**: Receives repository via constructor
3. **Error Handling**: Uses TRPCError for consistent error responses
4. **Tier-Based Limits**: Enforces subscription-based feature limits
5. **Context Access**: Can access `Context` for user session and customer state

### Registering Services

Add your service to `packages/api/src/services/index.ts`:

```typescript
export * from "./example-service";
import { ExampleService } from "./example-service";
import type { Repositories } from "@better-auth-cloudflare-starter/db/repositories";

export type Services = {
  todos: TodoService;
  buckets: BucketService;
  examples: ExampleService; // Add your service here
};

export const createServices = (repositories: Repositories): Services => {
  return {
    todos: new TodoService(repositories.todos),
    buckets: new BucketService(),
    examples: new ExampleService(repositories.examples), // Instantiate here
  };
};
```

---

## Service Locator Pattern

The **Service Locator** pattern centralizes service initialization and provides them via Hono middleware.

### How It Works

1. **Middleware Initialization** (`apps/server/src/middleware/services.ts`):
   - Creates repositories once (cached)
   - Creates services once (cached)
   - Injects services into Hono context

2. **Context Access** (`packages/api/src/context.ts`):
   - Services are available via `ctx.services`
   - Type-safe access throughout the application

### Usage in Routers

```typescript
// packages/api/src/routers/example.ts
import { z } from "zod";
import { protectedProcedure, router } from "../index";

export const exampleRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user) {
      throw new Error("User not found");
    }
    // Access service from context
    return ctx.services.examples.list(ctx.session.user.id);
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user) {
        throw new Error("User not found");
      }
      // Pass context for tier checking
      return ctx.services.examples.create(
        ctx.session.user.id,
        input,
        ctx
      );
    }),
});
```

### Benefits

- **Lazy Initialization**: Services created only once
- **Caching**: Repositories and services are cached
- **Type Safety**: Full TypeScript support
- **Dependency Injection**: Services receive repositories automatically

---

## Bucket Service

The **Bucket Service** provides type-safe access to Cloudflare R2 buckets.

### Type-Safe Bucket Names

Bucket names are automatically extracted from your `CloudflareBindings` type:

```typescript
// Bucket names are inferred from wrangler.jsonc configuration
export type BucketName = ExtractR2BucketKeys<EnvType>;
// Result: "PUBLIC_BUCKET" | "PRIVATE_BUCKET" | ...
```

### Configuration

Add buckets to `apps/server/wrangler.jsonc`:

```jsonc
{
  "r2_buckets": [
    {
      "binding": "PUBLIC_BUCKET",
      "bucket_name": "public-bucket-dev",
      "remote": true
    },
    {
      "binding": "PRIVATE_BUCKET",
      "bucket_name": "private-bucket-dev",
      "remote": true
    }
  ]
}
```

After adding, regenerate types:
```bash
cd apps/server
bun run cf-typegen
```

### Usage Examples

#### Upload a File

```typescript
// In a router or service
const file = input.get("file") as File;

const result = await ctx.services.buckets.put(
  file,                    // File, Blob, ReadableStream, ArrayBuffer, or string
  "path/to/file.jpg",      // Key/path in bucket
  "PUBLIC_BUCKET",         // Type-safe bucket name
  {
    httpMetadata: {
      contentType: file.type,
      cacheControl: "public, max-age=3600",
    },
    customMetadata: {
      userId: ctx.session.user.id,
    },
  }
);

console.log(result.key); // "path/to/file.jpg"
```

#### Get a File

```typescript
const fileData = await ctx.services.buckets.get(
  "path/to/file.jpg",
  "PUBLIC_BUCKET"
);

if (fileData) {
  const stream = fileData.body;
  // Use the stream...
}
```

#### Delete a File

```typescript
// Delete single file
await ctx.services.buckets.delete("path/to/file.jpg", "PUBLIC_BUCKET");

// Delete multiple files
await ctx.services.buckets.delete(
  ["file1.jpg", "file2.jpg", "file3.jpg"],
  "PUBLIC_BUCKET"
);
```

#### List Files

```typescript
const files = await ctx.services.buckets.list("PUBLIC_BUCKET", {
  prefix: "uploads/",
  limit: 100,
  include: ["httpMetadata", "customMetadata"],
});

console.log(files.objects); // Array of R2Object
console.log(files.truncated); // boolean
if (files.truncated) {
  console.log(files.cursor); // For pagination
}
```

#### Get File Metadata

```typescript
const metadata = await ctx.services.buckets.head(
  "path/to/file.jpg",
  "PUBLIC_BUCKET"
);

if (metadata) {
  console.log(metadata.size); // File size in bytes
  console.log(metadata.etag); // ETag for caching
  console.log(metadata.httpMetadata?.contentType); // MIME type
}
```

#### Check if Bucket Exists

```typescript
if (ctx.services.buckets.has("PUBLIC_BUCKET")) {
  // Bucket is available
}
```

#### Get All Bucket Names

```typescript
const bucketNames = ctx.services.buckets.getBucketNames();
// Returns: ["PUBLIC_BUCKET", "PRIVATE_BUCKET", ...]
```

### Supported File Types

The `put` method accepts:
- `File` (automatically converted to ReadableStream)
- `Blob`
- `ReadableStream`
- `ArrayBuffer`
- `ArrayBufferView` (Uint8Array, etc.)
- `string`
- `null`

### Type Safety

- **Bucket names** are validated at compile time
- **Options** use native R2 types (`R2PutOptions`, `R2GetOptions`, `R2ListOptions`)
- **Return types** match R2 API exactly

---

## Creating New Features

Follow these steps to add a new feature with repository and service layers:

### Step 1: Create Database Schema

```typescript
// packages/db/src/schema/example.ts
import { user } from "./auth";
import { relations } from "drizzle-orm";
import { text, timestamp, pgTable, index } from "drizzle-orm/pg-core";

export const example = pgTable(
  "example",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("example_user_id_idx").on(table.userId),
  })
);

export const exampleRelations = relations(example, ({ one }) => ({
  user: one(user, {
    fields: [example.userId],
    references: [user.id],
  }),
}));

export type Example = typeof example.$inferSelect;
export type NewExample = typeof example.$inferInsert;
```

Export in `packages/db/src/schema/index.ts`:
```typescript
export * from "./example";
```

### Step 2: Create Migration

```bash
cd packages/db
bun run db:generate
bun run db:push
```

### Step 3: Create Repository

Create `packages/db/src/repositories/example-repository.ts` (see [Repository Pattern](#repository-pattern) above).

### Step 4: Register Repository

Add to `packages/db/src/repositories/index.ts` (see [Registering Repositories](#registering-repositories) above).

### Step 5: Create Service

Create `packages/api/src/services/example-service.ts` (see [Service Layer Pattern](#service-layer-pattern) above).

### Step 6: Register Service

Add to `packages/api/src/services/index.ts` (see [Registering Services](#registering-services) above).

### Step 7: Create Router

```typescript
// packages/api/src/routers/example.ts
import { z } from "zod";
import { protectedProcedure, router } from "../index";

export const exampleRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user) throw new Error("User not found");
    return ctx.services.examples.list(ctx.session.user.id);
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user) throw new Error("User not found");
      return ctx.services.examples.create(ctx.session.user.id, input, ctx);
    }),

  // ... other routes
});
```

### Step 8: Register Router

Add to `packages/api/src/routers/index.ts`:

```typescript
import { exampleRouter } from "./example";

export const appRouter = router({
  // ... existing routes
  example: exampleRouter,
});
```

### Step 9: Create Frontend Route (Optional)

Create `apps/web/src/routes/__authenticated/examples.tsx` and use tRPC hooks.

---

## Best Practices

### Repository Layer

- ✅ Keep repositories focused on data access only
- ✅ Always filter by `userId` for user-scoped data
- ✅ Use Drizzle ORM types for type safety
- ✅ Return `null` for not found, throw for errors
- ❌ Don't include business logic
- ❌ Don't access context or session

### Service Layer

- ✅ Implement business logic and validation
- ✅ Enforce tier-based limits
- ✅ Use TRPCError for consistent errors
- ✅ Access context for user/subscription data
- ✅ Keep services focused on one domain
- ❌ Don't perform direct database operations (use repository)

### Bucket Service

- ✅ Use type-safe bucket names
- ✅ Set appropriate metadata (contentType, cacheControl)
- ✅ Handle errors gracefully
- ✅ Use prefixes for organization (`uploads/`, `avatars/`)
- ❌ Don't hardcode bucket names (use `BucketName` type)

---

## Example: Complete Feature

See the **Todo** feature for a complete reference implementation:

- **Schema**: `packages/db/src/schema/todo.ts`
- **Repository**: `packages/db/src/repositories/todo-repository.ts`
- **Service**: `packages/api/src/services/todo-service.ts`
- **Router**: `packages/api/src/routers/todo.ts`
- **Frontend**: `apps/web/src/routes/__authenticated/todos.tsx`

This example demonstrates:
- CRUD operations
- Tier-based limits (free: 10, pro: unlimited)
- User isolation
- Error handling
- Type safety

---

## Summary

This architecture provides:

1. **Separation of Concerns**: Data access (repository) vs business logic (service)
2. **Type Safety**: End-to-end TypeScript types
3. **Dependency Injection**: Clean, testable code
4. **Tier-Based Features**: Easy to implement subscription limits
5. **Scalability**: Easy to add new features following the pattern

For questions or improvements, refer to the existing Todo implementation or open an issue.

