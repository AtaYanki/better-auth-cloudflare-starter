import type { Channel } from "../channels";
import type { SyncChannelDO } from "../do/sync-channel-do";
import type { SyncEvent } from "../protocol";
import type { SyncPublisher } from "../publisher";

/**
 * SyncPublisher backed by the SYNC_CHANNEL Durable Object namespace.
 *
 * Fire-and-forget by contract: each publish is handed to `waitUntil` so the
 * Worker stays alive until the DO RPC completes (a bare floating promise can
 * be cancelled when the response finishes), while mutations never wait on —
 * or fail because of — fan-out. Event coalescing happens inside the DO.
 */
export function createDurableObjectSyncPublisher(
	namespace: DurableObjectNamespace<SyncChannelDO>,
	waitUntil: (promise: Promise<unknown>) => void,
): SyncPublisher {
	return {
		publish(channels: readonly Channel[], event: SyncEvent): void {
			for (const channel of channels) {
				try {
					waitUntil(
						namespace
							.getByName(channel)
							.publish(event)
							.catch((error: unknown) => {
								console.error("[sync] publish failed", channel, event, error);
							}),
					);
				} catch (error) {
					console.error("[sync] publish dispatch failed", channel, error);
				}
			}
		},
	};
}
