import { POLAR_PRODUCTS } from "@better-auth-cloudflare-starter/auth/lib/polar-products";
import type { TodoRepository } from "@better-auth-cloudflare-starter/db/repositories";
import { TRPCError } from "@trpc/server";
import type { Context } from "../context";

const TIER_LIMITS = {
	free: {
		maxTodos: 10,
	},
	pro: {
		maxTodos: Number.POSITIVE_INFINITY,
	},
} as const;

export class TodoService {
	constructor(private readonly todoRepository: TodoRepository) {}

	private async checkTodoLimit(
		userId: string,
		context: Context,
	): Promise<void> {
		const totalCount = await this.todoRepository.getTotalCount(userId);

		const tier = await this.getUserTier(context);
		const limit = TIER_LIMITS[tier].maxTodos;

		if (totalCount >= limit) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: `You've reached your ${tier} plan limit of ${limit} todos. Upgrade to Pro for unlimited todos.`,
			});
		}
	}

	private async getUserTier(context: Context): Promise<"free" | "pro"> {
		const customerState = context.customerState;
		if (
			(customerState?.activeSubscriptions ?? []).some(
				(subscription) => subscription.productId === POLAR_PRODUCTS.pro.id,
			)
		) {
			return "pro";
		}
		return "free";
	}

	async create(
		userId: string,
		data: { title: string; description?: string },
		context: Context,
	) {
		await this.checkTodoLimit(userId, context);

		const newTodo = await this.todoRepository.create({
			id: crypto.randomUUID(),
			userId,
			title: data.title,
			description: data.description || null,
			completed: false,
		});

		return newTodo;
	}

	async list(userId: string) {
		return this.todoRepository.findByUserId(userId);
	}

	async get(id: string, userId: string) {
		const foundTodo = await this.todoRepository.findById(id, userId);
		if (!foundTodo) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Todo not found",
			});
		}
		return foundTodo;
	}

	async update(
		id: string,
		userId: string,
		data: { title?: string; description?: string; completed?: boolean },
	) {
		const updatedTodo = await this.todoRepository.update(id, userId, data);
		if (!updatedTodo) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Todo not found",
			});
		}
		return updatedTodo;
	}

	async toggleComplete(id: string, userId: string) {
		const updatedTodo = await this.todoRepository.toggleComplete(id, userId);
		if (!updatedTodo) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Todo not found",
			});
		}
		return updatedTodo;
	}

	async delete(id: string, userId: string) {
		const deleted = await this.todoRepository.delete(id, userId);
		if (!deleted) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Todo not found",
			});
		}
		return { success: true };
	}

	async getStats(userId: string) {
		const [total, completed] = await Promise.all([
			this.todoRepository.getTotalCount(userId),
			this.todoRepository.getCompletedCount(userId),
		]);

		return {
			total,
			completed,
			pending: total - completed,
		};
	}
}
