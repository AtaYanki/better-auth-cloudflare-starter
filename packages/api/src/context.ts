import type { auth } from "@better-auth-cloudflare-starter/auth";
import type { Context as HonoContext } from "hono";
import type { Services } from "./services";

type SessionResult = Awaited<ReturnType<typeof auth.api.getSession>>;
type CustomerStateResult = Awaited<ReturnType<typeof auth.api.state>>;

export type CreateContextOptions = {
	context: HonoContext<{
		Bindings: CloudflareBindings;
		Variables: {
			services: Services;
			session?: SessionResult;
			customerState?: CustomerStateResult;
		};
	}>;
};

export function createContext({ context }: CreateContextOptions) {
	// Reuse session and customerState from Hono auth middleware to avoid redundant fetches
	const session = context.get("session") ?? null;
	const customerState = context.get("customerState") ?? null;

	return {
		session,
		customerState,
		context,
		services: context.var.services,
	};
}

export type Context = ReturnType<typeof createContext>;
