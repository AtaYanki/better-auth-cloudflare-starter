import { authMiddleware } from "@/middleware/auth";
import { createServerFn } from "@tanstack/react-start";

export const getUser = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		console.log("context", context);
		return context.session;
	});
