import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

/**
 * Integration tests for GET /sync/:channel through the full Hono stack.
 * No session cookie is available in this environment, so these cover the
 * rejection paths; authorized-path behavior is covered by the DO unit tests
 * (the route only forwards verified headers, which those tests exercise).
 */
describe("GET /sync/:channel", () => {
	it("rejects non-WebSocket requests with 426", async () => {
		const response = await SELF.fetch("http://local.test/sync/user%3Aabc");
		expect(response.status).toBe(426);
	});

	it("rejects unauthenticated upgrades with 401", async () => {
		const response = await SELF.fetch("http://local.test/sync/user%3Aabc", {
			headers: { Upgrade: "websocket" },
		});
		expect(response.status).toBe(401);
	});

	it("rejects spoofed x-sync-* headers from unauthenticated clients", async () => {
		const response = await SELF.fetch("http://local.test/sync/user%3Aabc", {
			headers: {
				Upgrade: "websocket",
				"x-sync-user-id": "abc",
				"x-sync-channel": "user:abc",
			},
		});
		// Still 401: identity comes from the session, never from headers.
		expect(response.status).toBe(401);
	});
});
