import { env } from "cloudflare:workers";
import { Polar } from "@polar-sh/sdk";

export const polarClient = new Polar({
	accessToken: env.POLAR_ACCESS_TOKEN || "polar_placeholder",
	server: "sandbox",
});
