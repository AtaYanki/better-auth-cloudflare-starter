import {
	ChannelAuthorizerRegistry,
	userChannelAuthorizer,
} from "@better-auth-cloudflare-starter/sync/server";
import { describe, expect, it } from "vitest";

describe("ChannelAuthorizerRegistry", () => {
	const registry = new ChannelAuthorizerRegistry().register(
		"user",
		userChannelAuthorizer,
	);

	it("denies malformed channels with 400", async () => {
		for (const raw of ["", "user", "user:", ":id", "user:!!!", "USER:abc"]) {
			const result = await registry.authorize(raw, "abc");
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.status).toBe(400);
			}
		}
	});

	it("denies unregistered channel types (default deny)", async () => {
		const result = await registry.authorize("org:abc", "abc");
		expect(result).toEqual({
			ok: false,
			status: 403,
			reason: "Unknown channel type",
		});
	});

	it("allows a user only on their own channel", async () => {
		expect(await registry.authorize("user:abc", "abc")).toEqual({
			ok: true,
			channel: "user:abc",
		});
		const denied = await registry.authorize("user:abc", "someone-else");
		expect(denied.ok).toBe(false);
		if (!denied.ok) {
			expect(denied.status).toBe(403);
		}
	});

	it("treats a throwing authorizer as a denial", async () => {
		const throwing = new ChannelAuthorizerRegistry().register("boom", () => {
			throw new Error("db down");
		});
		const result = await throwing.authorize("boom:x", "abc");
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.status).toBe(403);
		}
	});
});
