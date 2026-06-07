import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import type { Channel } from "../channels";
import { SyncClient, type SyncStatus } from "../client/sync-client";
import type { BroadcastMessage, PresenceMessage } from "../protocol";
import type { SyncQueryRegistry } from "./registry";

export interface UseSyncEngineOptions {
	/** Gate on session presence; the hook additionally guards against SSR. */
	enabled: boolean;
	baseUrl: string;
	channels: readonly Channel[];
	registry: SyncQueryRegistry;
	webSocketFactory?: (url: string) => WebSocket;
	onBroadcast?: (channel: Channel, message: BroadcastMessage) => void;
	onPresence?: (channel: Channel, message: PresenceMessage) => void;
}

export interface UseSyncEngineResult {
	statuses: Partial<Record<Channel, SyncStatus>>;
	sendBroadcast: (channel: Channel, topic: string, payload: unknown) => void;
	requestPresence: (channel: Channel) => void;
}

/**
 * Connects the sync engine to TanStack Query: invalidation events invalidate
 * the registry's mapped keys; reconnects invalidate all root keys (catch-up —
 * the server keeps no event log by design). The client is created lazily
 * inside an effect, so server rendering never touches WebSocket.
 */
export function useSyncEngine(
	options: UseSyncEngineOptions,
): UseSyncEngineResult {
	const queryClient = useQueryClient();
	const clientRef = useRef<SyncClient | null>(null);
	const [statuses, setStatuses] = useState<
		Partial<Record<Channel, SyncStatus>>
	>({});

	// Mutable refs so the long-lived client always sees current callbacks.
	const callbacksRef = useRef(options);
	callbacksRef.current = options;

	const enabled = options.enabled && typeof window !== "undefined";
	const channelsKey = options.channels.join(",");

	useEffect(() => {
		if (!enabled) {
			return;
		}
		const client = new SyncClient({
			baseUrl: options.baseUrl,
			webSocketFactory: callbacksRef.current.webSocketFactory,
			onMessage: (channel, message) => {
				const current = callbacksRef.current;
				switch (message.type) {
					case "invalidate":
						for (const queryKey of current.registry.keysFor(message)) {
							queryClient.invalidateQueries({ queryKey: [...queryKey] });
						}
						break;
					case "broadcast":
						current.onBroadcast?.(channel, message);
						break;
					case "presence":
						current.onPresence?.(channel, message);
						break;
					case "kick":
						break;
				}
			},
			onStatusChange: (channel, status) => {
				setStatuses((previous) => ({ ...previous, [channel]: status }));
			},
			onReconnected: () => {
				for (const queryKey of callbacksRef.current.registry.allRootKeys()) {
					queryClient.invalidateQueries({ queryKey: [...queryKey] });
				}
			},
		});
		clientRef.current = client;
		return () => {
			clientRef.current = null;
			client.close();
		};
	}, [enabled, options.baseUrl, queryClient]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: `enabled` re-fires this effect after the client is (re)created above, so the fresh client receives the current channel set.
	useEffect(() => {
		clientRef.current?.setChannels(
			channelsKey ? (channelsKey.split(",") as Channel[]) : [],
		);
	}, [channelsKey, enabled]);

	return {
		statuses,
		sendBroadcast: (channel, topic, payload) =>
			clientRef.current?.sendBroadcast(channel, topic, payload),
		requestPresence: (channel) => clientRef.current?.requestPresence(channel),
	};
}
