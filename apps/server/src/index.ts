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

export type AuthVariables = {
	session?: Awaited<ReturnType<typeof auth.api.getSession>>;
	customerState?: Awaited<ReturnType<typeof auth.api.state>>;
};

export type HonoEnv = {
	Bindings: CloudflareBindings;
	Variables: {
		services: Services;
	} & AuthVariables;
};

const app = new Hono<HonoEnv>();

app.use("*", servicesMiddleware);
app.use("*", secureHeaders());
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

app.get("/api/payments/native-success", (c) => {
	const checkoutId = c.req.query("checkout_id") || "";
	if (!/^[a-zA-Z0-9_-]{0,200}$/.test(checkoutId)) {
		return c.text("Invalid checkout ID", 400);
	}
	const appScheme = "better-auth-cloudflare-starter";
	const deepLink = `${appScheme}://checkout-success?checkout_id=${encodeURIComponent(checkoutId)}`;

	return c.html(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Payment Successful</title>
<meta http-equiv="refresh" content="0;url=${deepLink}">
</head>
<body style="font-family:system-ui;text-align:center;padding:2rem;">
<h1>Payment Successful!</h1>
<p>Redirecting you back to the app...</p>
<p><a href="${deepLink}">Tap here if you are not redirected automatically</a></p>
<script>window.location.href="${deepLink}";</script>
</body>
</html>`);
});

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
		return c.json(
			{ error: error.message, stack: error.stack },
			500,
		);
	}
	return c.json({ error: "Internal server error" }, 500);
});

export default app;
