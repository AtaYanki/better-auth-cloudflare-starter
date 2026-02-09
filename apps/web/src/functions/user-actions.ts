import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { authClient } from "@/lib/auth-client";
import { authMiddleware } from "@/middleware/auth";

export const banUser = createServerFn()
	.middleware([authMiddleware])
	.inputValidator(
		(data: { userId: string; banReason?: string; banExpiresIn?: number }) =>
			data,
	)
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
	.inputValidator((data: { userId: string }) => data)
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
	.inputValidator((data: { userId: string }) => data)
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
	.inputValidator((data: { userId: string; role: "user" | "admin" }) => data)
	.handler(async ({ data }) => {
		const result = await authClient.admin.setRole({
			userId: data.userId,
			role: data.role,
		});
		return result;
	});
