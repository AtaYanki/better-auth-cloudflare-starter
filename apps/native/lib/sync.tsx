import {
	type Channel,
	userChannel,
} from "@better-auth-cloudflare-starter/sync";
import {
	createSyncQueryRegistry,
	useSyncEngine,
} from "@better-auth-cloudflare-starter/sync/react";
import { useMemo } from "react";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

const registry = createSyncQueryRegistry().register("todo", {
	rootKeys: () => [trpc.todo.pathKey()],
	onEvent: () => [trpc.todo.list.queryKey(), trpc.todo.stats.queryKey()],
});

/**
 * React Native's WebSocket supports an options object with headers; the
 * session cookie must be attached explicitly (no browser cookie jar).
 */
function createNativeWebSocket(url: string): WebSocket {
	const cookie = authClient.getCookie();
	const RNWebSocket = WebSocket as unknown as new (
		url: string,
		protocols?: string[] | null,
		options?: { headers?: Record<string, string> },
	) => WebSocket;
	return new RNWebSocket(url, null, {
		headers: cookie ? { Cookie: cookie } : {},
	});
}

/** Mounts real-time sync for the signed-in user. Renders nothing. */
export function SyncEngine() {
	const { data: session } = authClient.useSession();

	const userId = session?.user.id;
	const channels = useMemo<Channel[]>(
		() => (userId ? [userChannel(userId)] : []),
		[userId],
	);

	useSyncEngine({
		enabled: Boolean(userId),
		baseUrl: process.env.EXPO_PUBLIC_SERVER_URL ?? "",
		channels,
		registry,
		webSocketFactory: createNativeWebSocket,
	});

	return null;
}
