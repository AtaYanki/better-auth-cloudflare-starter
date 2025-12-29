import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { env } from "cloudflare:workers";
import { trpcServer } from "@hono/trpc-server";
import { servicesMiddleware } from "./middleware/services";
import { auth } from "@better-auth-cloudflare-starter/auth";
import { createContext } from "@better-auth-cloudflare-starter/api/context";
import type { Services } from "@better-auth-cloudflare-starter/api/services";
import { appRouter } from "@better-auth-cloudflare-starter/api/routers/index";

export type HonoEnv = {
  Bindings: CloudflareBindings;
  Variables: {
    services: Services;
  };
};

const app = new Hono<HonoEnv>();

app.use("*", servicesMiddleware);

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
