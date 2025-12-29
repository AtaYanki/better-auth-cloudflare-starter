import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { env } from "cloudflare:workers";
import { trpcServer } from "@hono/trpc-server";
import { rateLimiter } from "hono-rate-limiter";
import { authMiddleware } from "./middleware/auth";
import { servicesMiddleware } from "./middleware/services";
import { auth } from "@better-auth-cloudflare-starter/auth";
import { createContext } from "@better-auth-cloudflare-starter/api/context";
import type { Services } from "@better-auth-cloudflare-starter/api/services";
import { appRouter } from "@better-auth-cloudflare-starter/api/routers/index";
import { POLAR_PRODUCTS } from "@better-auth-cloudflare-starter/auth/lib/polar-products";

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
  })
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.use(
  rateLimiter<HonoEnv>({
    binding: (c) => {
      const session = c.get("session");
      const customerState = c.get("customerState");

      const isAuthenticated = !!session?.user;
      const isPaidUser =
        customerState?.activeSubscriptions?.some(
          (subscription) => subscription.productId === POLAR_PRODUCTS.pro.id
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
  })
);

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: (_opts, context) => {
      return createContext({ context });
    },
  })
);

app.get("/", (c) => {
  return c.text("OK");
});

export default app;
