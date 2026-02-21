import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { authMiddleware } from "@/middleware/auth";

const paginationSchema = z.object({
	limit: z.number().min(1).max(100).optional().default(100),
	offset: z.number().min(0).optional().default(0),
});

export const getUserList = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((data: unknown) =>
		paginationSchema.parse(data ?? { limit: 100, offset: 0 }),
	)
	.handler(async ({ data }) => {
		const { data: users } = await authClient.admin.listUsers({
			query: {
				limit: data.limit,
				offset: data.offset,
			},
			fetchOptions: {
				headers: getRequestHeaders(),
			},
		});
		return users?.users;
	});
