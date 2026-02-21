import { env } from "cloudflare:workers";
import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";

const isProduction = env.NODE_ENV !== "development";

export const t = initTRPC.context<Context>().create({
	errorFormatter({ shape, error }) {
		if (isProduction && error.code === "INTERNAL_SERVER_ERROR") {
			return {
				...shape,
				message: "Internal server error",
				data: {
					...shape.data,
					stack: undefined,
				},
			};
		}
		return {
			...shape,
			data: {
				...shape.data,
				stack: isProduction ? undefined : shape.data.stack,
			},
		};
	},
});

export const router = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.session?.user) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Authentication required",
			cause: "No session",
		});
	}
	return next({
		ctx: {
			...ctx,
			session: ctx.session as typeof ctx.session & {
				user: NonNullable<NonNullable<typeof ctx.session>["user"]>;
			},
		},
	});
});
