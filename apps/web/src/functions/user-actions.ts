import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { authMiddleware } from "@/middleware/auth";

const userIdSchema = z.object({
	userId: z.string().min(1),
});

const banUserSchema = z.object({
	userId: z.string().min(1),
	banReason: z.string().max(500).optional(),
	banExpiresIn: z.number().positive().optional(),
});

const changeRoleSchema = z.object({
	userId: z.string().min(1),
	role: z.enum(["user", "admin"]),
});

export const banUser = createServerFn()
	.middleware([authMiddleware])
	.inputValidator((data: unknown) => banUserSchema.parse(data))
	.handler(async ({ data }) => {
		const result = await authClient.admin.banUser({
			userId: data.userId,
			banReason: data.banReason,
			banExpiresIn: data.banExpiresIn,
			fetchOptions: {
				headers: getRequestHeaders(),
			},
		});
		return result;
	});

export const unbanUser = createServerFn()
	.middleware([authMiddleware])
	.inputValidator((data: unknown) => userIdSchema.parse(data))
	.handler(async ({ data }) => {
		const result = await authClient.admin.unbanUser({
			userId: data.userId,
			fetchOptions: {
				headers: getRequestHeaders(),
			},
		});
		return result;
	});

export const deleteUser = createServerFn()
	.middleware([authMiddleware])
	.inputValidator((data: unknown) => userIdSchema.parse(data))
	.handler(async ({ data }) => {
		const result = await authClient.admin.removeUser({
			userId: data.userId,
			fetchOptions: {
				headers: getRequestHeaders(),
			},
		});
		return result;
	});

export const changeUserRole = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((data: unknown) => changeRoleSchema.parse(data))
	.handler(async ({ data }) => {
		const result = await authClient.admin.setRole({
			userId: data.userId,
			role: data.role,
		});
		return result;
	});
