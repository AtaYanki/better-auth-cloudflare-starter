import type { auth } from "@better-auth-cloudflare-starter/auth";
import type { Context as HonoContext } from "hono";
import type { Services } from "./services";

type SessionResult = Awaited<ReturnType<typeof auth.api.getSession>>;

export type CreateContextOptions = {
	context: HonoContext<{
		Bindings: CloudflareBindings;
		Variables: {
			services: Services;
			session?: SessionResult;
		};
	}>;
};

export function createContext({ context }: CreateContextOptions) {
	// Reuse session from Hono auth middleware to avoid redundant fetches
	const session = context.get("session") ?? null;

	return {
		session,
		context,
		services: context.var.services,
	};
}

export type Context = ReturnType<typeof createContext>;
