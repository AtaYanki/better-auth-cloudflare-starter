import { z } from "zod";
import { protectedProcedure, router } from "../index";

export const todoRouter = router({
	list: protectedProcedure.query(async ({ ctx }) => {
		if (!ctx.session?.user) {
			throw new Error("User not found");
		}
		return ctx.services.todos.list(ctx.session.user.id);
	}),

	get: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			if (!ctx.session?.user) {
				throw new Error("User not found");
			}
			return ctx.services.todos.get(input.id, ctx.session.user.id);
		}),

	create: protectedProcedure
		.input(
			z.object({
				title: z.string().min(1).max(200),
				description: z.string().max(1000).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.session?.user) {
				throw new Error("User not found");
			}
			return ctx.services.todos.create(ctx.session.user.id, input, ctx);
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				title: z.string().min(1).max(200).optional(),
				description: z.string().max(1000).optional(),
				completed: z.boolean().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.session?.user) {
				throw new Error("User not found");
			}
			const { id, ...data } = input;
			return ctx.services.todos.update(id, ctx.session.user.id, data);
		}),

	toggleComplete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			if (!ctx.session?.user) {
				throw new Error("User not found");
			}
			return ctx.services.todos.toggleComplete(input.id, ctx.session.user.id);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			if (!ctx.session?.user) {
				throw new Error("User not found");
			}
			return ctx.services.todos.delete(input.id, ctx.session.user.id);
		}),

	stats: protectedProcedure.query(async ({ ctx }) => {
		if (!ctx.session?.user) {
			throw new Error("User not found");
		}
		return ctx.services.todos.getStats(ctx.session.user.id);
	}),
});
