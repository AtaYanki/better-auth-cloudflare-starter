import { createFactory } from "hono/factory";
import type { HonoEnv } from "..";
import { syncAuthorizers } from "../sync/authorizers";

const F = createFactory<HonoEnv>();

/**
 * WebSocket upgrade endpoint for the sync engine.
 *
 * Flow: validate the Upgrade header → require a session (set by
 * authMiddleware) → authorize the requested channel (default deny) → forward
 * the upgrade to the channel's Durable Object with verified identity headers.
 * The DO trusts ONLY these worker-set headers; any client-supplied values are
 * stripped first.
 */
export const syncUpgradeHandler = F.createHandlers(async (c) => {
	if (c.req.header("upgrade")?.toLowerCase() !== "websocket") {
		return c.text("Expected WebSocket upgrade", 426);
	}

	const session = c.get("session");
	if (!session?.user) {
		return c.text("Unauthorized", 401);
	}

	const rawChannel = decodeURIComponent(c.req.param("channel") ?? "");
	const result = await syncAuthorizers.authorize(rawChannel, session.user.id);
	if (!result.ok) {
		return c.text(result.reason, result.status);
	}

	const headers = new Headers(c.req.raw.headers);
	for (const name of [
		"x-sync-user-id",
		"x-sync-channel",
		"x-sync-expires-at",
	]) {
		headers.delete(name);
	}
	headers.set("x-sync-user-id", session.user.id);
	headers.set("x-sync-channel", result.channel);
	headers.set(
		"x-sync-expires-at",
		String(new Date(session.session.expiresAt).getTime()),
	);

	const stub = c.env.SYNC_CHANNEL.getByName(result.channel);
	return stub.fetch(new Request(c.req.raw, { headers }));
});
