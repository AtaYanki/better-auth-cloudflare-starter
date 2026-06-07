import type { Context } from "@better-auth-cloudflare-starter/api/context";
import { TodoService } from "@better-auth-cloudflare-starter/api/services/todo-service";
import { POLAR_PRODUCTS } from "@better-auth-cloudflare-starter/auth/lib/polar-products";
import type {
	Repositories,
	TodoRepository,
} from "@better-auth-cloudflare-starter/db/repositories";
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

function contextWithTier(tier: "free" | "pro"): Context {
	return {
		session: null,
		customerState:
			tier === "pro"
				? { activeSubscriptions: [{ productId: POLAR_PRODUCTS.pro.id }] }
				: { activeSubscriptions: [] },
		services: { todos: {} } as unknown as Repositories,
	} as unknown as Context;
}

describe("TodoService tier limits", () => {
	it("allows free users below the limit", async () => {
		const service = new TodoService(fakeRepository(9));
		const todo = await service.create(
			"u1",
			{ title: "ok" },
			contextWithTier("free"),
		);
		expect(todo.title).toBe("ok");
	});

	it("blocks free users at the 10-todo limit with FORBIDDEN", async () => {
		const service = new TodoService(fakeRepository(10));
		await expect(
			service.create("u1", { title: "nope" }, contextWithTier("free")),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("lets pro users create past the free limit", async () => {
		const service = new TodoService(fakeRepository(10_000));
		const todo = await service.create(
			"u1",
			{ title: "unlimited" },
			contextWithTier("pro"),
		);
		expect(todo.title).toBe("unlimited");
	});

	it("throws NOT_FOUND when deleting a missing todo", async () => {
		const service = new TodoService(fakeRepository(0));
		await expect(service.delete("missing", "u1")).rejects.toBeInstanceOf(
			TRPCError,
		);
	});
});
