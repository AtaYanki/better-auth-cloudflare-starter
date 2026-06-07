import { env } from "cloudflare:workers";
import { createContext } from "@better-auth-cloudflare-starter/api/context";
import { appRouter } from "@better-auth-cloudflare-starter/api/routers/index";
import type { Services } from "@better-auth-cloudflare-starter/api/services";
import { auth } from "@better-auth-cloudflare-starter/auth";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { rateLimiter } from "hono-rate-limiter";
import { authMiddleware } from "./middleware/auth";
import { servicesMiddleware } from "./middleware/services";
import { syncUpgradeHandler } from "./routes/sync";

// Durable Object classes must be exported from the Worker entry module.
export { SyncChannelDO } from "@better-auth-cloudflare-starter/sync/do";

export type AuthVariables = {
	session?: Awaited<ReturnType<typeof auth.api.getSession>>;
};

export type HonoEnv = {
	Bindings: CloudflareBindings;
	Variables: {
		services: Services;
	} & AuthVariables;
};

const app = new Hono<HonoEnv>();

app.use("*", servicesMiddleware);
app.use(
	"*",
	secureHeaders({
		contentSecurityPolicy: {
			defaultSrc: ["'self'"],
			scriptSrc: ["'self'"],
			styleSrc: ["'self'", "'unsafe-inline'"],
			imgSrc: ["'self'", "data:", "blob:", env.BUCKET_URL].filter(
				Boolean,
			) as string[],
			connectSrc: ["'self'", env.CORS_ORIGIN].filter(Boolean) as string[],
			fontSrc: ["'self'"],
			objectSrc: ["'none'"],
			frameSrc: ["'none'"],
			baseUri: ["'self'"],
			formAction: ["'self'"],
		},
	}),
);
app.use("*", authMiddleware);

if (env.NODE_ENV === "development") {
	app.use(logger());
}
app.use(
	"/*",
	cors({
		origin: env.CORS_ORIGIN,
		allowMethods: ["GET", "POST", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));


// Registered BEFORE the rate limiter: reconnect bursts (e.g. after a deploy)
// must not burn users' rate budget. Authorization happens inside the handler.
app.get("/sync/:channel", ...syncUpgradeHandler);

app.use(
	rateLimiter<HonoEnv>({
		binding: (c) => {
			const session = c.get("session");
			const isAuthenticated = !!session?.user;

			if (isAuthenticated && c.env.AUTHENTICATED_RATE_LIMITER) {
				return c.env.AUTHENTICATED_RATE_LIMITER;
			}
			return c.env.UNAUTHENTICATED_RATE_LIMITER;
		},
		keyGenerator: (c) => {
			const userId = c.get("session")?.user?.id;
			if (userId) {
				return `user:${userId}`;
			}
			return (
				c.req.header("cf-connecting-ip") ??
				c.req.header("x-forwarded-for") ??
				"unknown"
			);
		},
	}),
);

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: (_opts, context) => {
			return createContext({ context });
		},
	}),
);

app.get("/", (c) => {
	return c.text("OK");
});

app.onError((error, c) => {
	console.error("Unhandled error:", error);
	if (env.NODE_ENV === "development") {
		return c.json({ error: error.message, stack: error.stack }, 500);
	}
	return c.json({ error: "Internal server error" }, 500);
});

export default app;
