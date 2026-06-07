import { TodoService } from "@better-auth-cloudflare-starter/api/services/todo-service";
import type { TodoRepository } from "@better-auth-cloudflare-starter/db/repositories";
import { TRPCError } from "@trpc/server";
import { describe, expect, it } from "vitest";

type Todo = Awaited<ReturnType<TodoRepository["create"]>>;

function fakeTodo(overrides: Partial<Todo> = {}): Todo {
	return {
		id: "t1",
		userId: "u1",
		title: "test",
		description: null,
		completed: false,
		createdAt: new Date(),
		updatedAt: new Date(),
		...overrides,
	};
}

function fakeRepository(totalCount: number): TodoRepository {
	return {
		create: async (data: Partial<Todo>) => fakeTodo(data),
		findById: async () => null,
		findByUserId: async () => [],
		getCompletedCount: async () => 0,
		getTotalCount: async () => totalCount,
		update: async () => null,
		delete: async () => false,
		toggleComplete: async () => null,
	} as unknown as TodoRepository;
}

describe("TodoService", () => {
	it("creates todos", async () => {
		const service = new TodoService(fakeRepository(0));
		const todo = await service.create("u1", { title: "ok" });
		expect(todo.title).toBe("ok");
	});

	it("throws NOT_FOUND when deleting a missing todo", async () => {
		const service = new TodoService(fakeRepository(0));
		await expect(service.delete("missing", "u1")).rejects.toBeInstanceOf(
			TRPCError,
		);
	});
});
