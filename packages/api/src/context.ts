import type { Services } from "./services";
import type { Context as HonoContext } from "hono";
import { auth } from "@better-auth-cloudflare-starter/auth";

export type CreateContextOptions = {
  context: HonoContext<{
    Bindings: CloudflareBindings;
    Variables: { services: Services };
  }>;
};

export async function createContext({ context }: CreateContextOptions) {
  // Gracefully handle auth failures for public procedures
  let session = null;
  let customerState = null;

  try {
    session = await auth.api.getSession({
      headers: context.req.raw.headers,
    });
  } catch (error) {
    // Session fetch failed - this is expected for unauthenticated requests
    // Continue with null session
  }

  try {
    customerState = await auth.api.state({
      headers: context.req.raw.headers,
    });
  } catch (error) {
    // Customer state fetch failed - this is expected for unauthenticated requests
    // Continue with null customerState
  }

  return {
    session,
    customerState,
    context,
    services: context.var.services,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
