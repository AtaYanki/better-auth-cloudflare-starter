/**
 * A channel is a broadcast domain: one Durable Object instance per channel.
 * Format: `${type}:${id}` — e.g. `user:abc123`, `org:xyz789`.
 * New channel types can be added without touching the engine; they only need
 * a registered authorizer on the server (default deny otherwise).
 */
export type Channel = `${string}:${string}`;

const CHANNEL_PATTERN = /^[a-z][a-z0-9-]{0,31}:[A-Za-z0-9_-]{1,64}$/;

export const userChannel = (userId: string): Channel => `user:${userId}`;
export const orgChannel = (orgId: string): Channel => `org:${orgId}`;

export interface ParsedChannel {
	type: string;
	id: string;
}

/**
 * Strict parse of an untrusted channel string. Returns null on anything
 * that doesn't match the expected shape (callers must treat null as deny).
 */
export function parseChannel(raw: string): ParsedChannel | null {
	if (!CHANNEL_PATTERN.test(raw)) {
		return null;
	}
	const separator = raw.indexOf(":");
	return {
		type: raw.slice(0, separator),
		id: raw.slice(separator + 1),
	};
}
