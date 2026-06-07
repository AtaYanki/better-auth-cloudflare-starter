import type { TodoRepository } from "@better-auth-cloudflare-starter/db/repositories";
import { TRPCError } from "@trpc/server";

export class TodoService {
	constructor(private readonly todoRepository: TodoRepository) {}

	async create(
		userId: string,
		data: { title: string; description?: string },
	) {
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
