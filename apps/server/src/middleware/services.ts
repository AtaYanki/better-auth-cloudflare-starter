import { createServices } from "@better-auth-cloudflare-starter/api/services";
import { createRepositories } from "@better-auth-cloudflare-starter/db/repositories";
import { createDurableObjectSyncPublisher } from "@better-auth-cloudflare-starter/sync/server";
import { createFactory } from "hono/factory";
import type { HonoEnv } from "..";

const F = createFactory<HonoEnv>();

/**
 * Built per-request (cheap: a handful of stateless class allocations) so the
 * sync publisher can bind this request's `waitUntil` — publishes must outlive
 * the response without ever delaying or failing the mutation that caused them.
 */
export const servicesMiddleware = F.createMiddleware(async (c, next) => {
	const publisher = createDurableObjectSyncPublisher(c.env.SYNC_CHANNEL, (p) =>
		c.executionCtx.waitUntil(p),
	);
	const repositories = createRepositories({ publisher });
	c.set("services", createServices(repositories));
	return next();
});
