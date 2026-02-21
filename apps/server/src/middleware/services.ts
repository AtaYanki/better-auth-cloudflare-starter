import {
	createServices,
	type Services,
} from "@better-auth-cloudflare-starter/api/services";
import {
	createRepositories,
	type Repositories,
} from "@better-auth-cloudflare-starter/db/repositories";
import { createFactory } from "hono/factory";
import type { HonoEnv } from "..";

const F = createFactory<HonoEnv>();

const repositories = createRepositories();
const services = createServices(repositories);

export const servicesMiddleware = F.createMiddleware(async (c, next) => {
	c.set("services", services);
	return next();
});
