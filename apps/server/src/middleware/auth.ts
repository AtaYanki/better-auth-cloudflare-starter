import { auth } from "@better-auth-cloudflare-starter/auth";
import { createFactory } from "hono/factory";
import type { HonoEnv } from "..";

const F = createFactory<HonoEnv>();

/**
 * Authentication middleware
 * Checks if user is authenticated and sets context variables
 */
export const authMiddleware = F.createMiddleware(async (c, next) => {
	try {
		// Get session from Better Auth
		const session = await auth.api.getSession({
			headers: c.req.raw.headers,
		});

		c.set("session", session);

	} catch (error) {
		console.error("Auth middleware error:", error);
		c.set("session", undefined);
	}

	return next();
});
