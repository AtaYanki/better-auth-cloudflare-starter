import { env } from "cloudflare:workers";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../index";
import { subscriptionRouter } from "./subscription";
import { todoRouter } from "./todo";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	todo: todoRouter,
	subscription: subscriptionRouter,
	uploadFile: protectedProcedure
		.input(z.instanceof(FormData))
		.mutation(async ({ ctx, input }) => {
			const file = input.get("file") as File;
			if (!file) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "File is required",
				});
			}

			const ALLOWED_MIME_TYPES = [
				"image/jpeg",
				"image/png",
				"image/webp",
				"image/gif",
			];

			if (!ALLOWED_MIME_TYPES.includes(file.type)) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: `File type "${file.type}" is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
				});
			}

			if (file.size > 1024 * 1024 * 5) {
				// 5MB
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "File size is too large",
					cause: `File size is ${file.size} bytes, max size is 5MB`,
				});
			}

			const data = await ctx.services.buckets.put(
				file,
				file.name,
				"PUBLIC_BUCKET",
				{
					httpMetadata: {
						contentType: file.type,
					},
				},
			);
			return {
				url: `${env.BUCKET_URL}/${data.key}`,
			};
		}),
	deleteFile: protectedProcedure
		.input(
			z.object({
				key: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { key } = input;
			await ctx.services.buckets.delete(key, "PUBLIC_BUCKET");
			return {
				message: "File deleted successfully",
			};
		}),
});
export type AppRouter = typeof appRouter;
