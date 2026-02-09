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

let cachedRepositories: Repositories | undefined;
let cachedServices: Services | undefined;

export const servicesMiddleware = F.createMiddleware(async (c, next) => {
	if (!cachedRepositories) {
		cachedRepositories = createRepositories();
	}

	if (!cachedServices) {
		cachedServices = createServices(cachedRepositories);
	}

	c.set("services", cachedServices);
	return next();
});
