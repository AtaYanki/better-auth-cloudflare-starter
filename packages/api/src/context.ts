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
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });
  
  const customerState = await auth.api.state({
    headers: context.req.raw.headers,
  });

  return {
    session,
    customerState,
    context,
    services: context.var.services,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
