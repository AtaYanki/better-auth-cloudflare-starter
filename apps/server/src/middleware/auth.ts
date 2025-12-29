import { auth } from "@better-auth-cloudflare-starter/auth";
import type { HonoEnv } from "..";
import { createFactory } from "hono/factory";

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

    // Get customer state if user is authenticated
    if (session?.user) {
      const customerState = await auth.api.state({
        headers: c.req.raw.headers,
      });
      c.set("customerState", customerState);
    } else {
      c.set("customerState", undefined);
    }
  } catch (error) {
    // If auth check fails, user is not authenticated
    c.set("session", undefined);
    c.set("customerState", undefined);
  }

  return next();
});

