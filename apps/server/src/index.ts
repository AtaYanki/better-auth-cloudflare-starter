import { env } from "cloudflare:workers";
import { createContext } from "@better-auth-cloudflare-starter/api/context";
import { appRouter } from "@better-auth-cloudflare-starter/api/routers/index";
import type { Services } from "@better-auth-cloudflare-starter/api/services";
import { auth } from "@better-auth-cloudflare-starter/auth";
import { POLAR_PRODUCTS } from "@better-auth-cloudflare-starter/auth/lib/polar-products";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
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
app.use("*", authMiddleware);

app.use(logger());
app.use(
	"/*",
	cors({
		origin: env.CORS_ORIGIN || "",
		allowMethods: ["GET", "POST", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.get("/api/payments/native-success", (c) => {
	const checkoutId = c.req.query("checkout_id") || "";
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
			const customerState = c.get("customerState");

			const isAuthenticated = !!session?.user;
			const isPaidUser =
				customerState?.activeSubscriptions?.some(
					(subscription) => subscription.productId === POLAR_PRODUCTS.pro.id,
				) ?? false;

			// Use different rate limiters based on authentication and subscription status
			if (isPaidUser && c.env.AUTHENTICATED_RATE_LIMITER) {
				return c.env.AUTHENTICATED_RATE_LIMITER;
			}
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

export default app;
