import { eq, and, desc, count } from "drizzle-orm";
import { db } from "../index";
import { todo, type Todo, type NewTodo } from "../schema/todo";

export class TodoRepository {
  async create(data: NewTodo): Promise<Todo> {
    const [newTodo] = await db.insert(todo).values(data).returning();
    if (!newTodo) {
      throw new Error("Failed to create todo");
    }
    return newTodo;
  }

  async findById(id: string, userId: string): Promise<Todo | null> {
    const [foundTodo] = await db
      .select()
      .from(todo)
      .where(and(eq(todo.id, id), eq(todo.userId, userId)))
      .limit(1);
    return foundTodo || null;
  }

  async findByUserId(userId: string): Promise<Todo[]> {
    return db
      .select()
      .from(todo)
      .where(eq(todo.userId, userId))
      .orderBy(desc(todo.createdAt));
  }

  async getCompletedCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(todo)
      .where(and(eq(todo.userId, userId), eq(todo.completed, true)));
    return result?.count || 0;
  }

  async getTotalCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(todo)
      .where(eq(todo.userId, userId));
    return result?.count || 0;
  }

  async update(
    id: string,
    userId: string,
    data: Partial<Omit<NewTodo, "id" | "userId" | "createdAt">>
  ): Promise<Todo | null> {
    const [updatedTodo] = await db
      .update(todo)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(todo.id, id), eq(todo.userId, userId)))
      .returning();
    return updatedTodo || null;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(todo)
      .where(and(eq(todo.id, id), eq(todo.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async toggleComplete(id: string, userId: string): Promise<Todo | null> {
    const existingTodo = await this.findById(id, userId);
    if (!existingTodo) {
      return null;
    }
    return this.update(id, userId, { completed: !existingTodo.completed });
  }
}
