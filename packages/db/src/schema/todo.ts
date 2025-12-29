import { user } from "./auth";
import { relations } from "drizzle-orm";
import { text, timestamp, boolean, pgTable, index, pgSchema } from "drizzle-orm/pg-core";

const todoSchema = pgSchema("todo");

export const todo = pgTable(
  "todo",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    completed: boolean("completed").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("todo_user_id_idx").on(table.userId),
    completedIdx: index("todo_completed_idx").on(table.completed),
  })
);

export const todoRelations = relations(todo, ({ one }) => ({
  user: one(user, {
    fields: [todo.userId],
    references: [user.id],
  }),
}));

export type Todo = typeof todo.$inferSelect;
export type NewTodo = typeof todo.$inferInsert;

