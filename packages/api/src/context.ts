import type { Context as HonoContext } from "hono";
import { auth } from "@better-auth-cloudflare-starter/auth";

export type CreateContextOptions = {
  context: HonoContext<{ Bindings: CloudflareBindings }>;
};

export async function createContext({ context }: CreateContextOptions) {
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });
  return {
    session,
    context
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
