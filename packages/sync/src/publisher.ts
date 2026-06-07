import type { Channel } from "./channels";
import type { SyncEvent } from "./protocol";

/**
 * Publishes sync events to channels. Implementations MUST be fire-and-forget:
 * publish() never throws and never makes callers await network I/O — a failing
 * publisher must never fail or slow down a database mutation.
 */
export interface SyncPublisher {
	publish(channels: readonly Channel[], event: SyncEvent): void;
}

/** Used outside Worker request contexts (scripts, drizzle-kit, tests). */
export const noopSyncPublisher: SyncPublisher = {
	publish() {},
};
