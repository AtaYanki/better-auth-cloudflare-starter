/**
 * Wire protocol for the sync engine. Versioned so clients can ignore
 * messages they don't understand (forward compatibility).
 *
 * Heartbeats are NOT part of this protocol: raw "ping"/"pong" strings are
 * answered by the Durable Object's hibernation auto-response without waking it.
 */
export const SYNC_PROTOCOL_VERSION = 1;

export type SyncOp = "create" | "update" | "delete";

/** The minimal event repositories emit. Carries metadata only — never row data. */
export interface SyncEvent {
	entity: string;
	op: SyncOp;
	id: string;
}

export type InvalidateMessage = SyncEvent & {
	v: 1;
	type: "invalidate";
	ts: number;
};

export interface PresenceMember {
	userId: string;
	connections: number;
}

export type PresenceMessage =
	| {
			v: 1;
			type: "presence";
			event: "snapshot";
			channel: string;
			members: PresenceMember[];
			ts: number;
	  }
	| {
			v: 1;
			type: "presence";
			event: "join" | "leave";
			channel: string;
			userId: string;
			ts: number;
	  };

export interface BroadcastMessage {
	v: 1;
	type: "broadcast";
	topic: string;
	payload: unknown;
	/** Stamped by the Durable Object from the verified socket identity — never client-supplied. */
	from: string;
	ts: number;
}

export interface KickMessage {
	v: 1;
	type: "kick";
	reason: "membership-revoked" | "session-expired";
	ts: number;
}

export type ServerMessage =
	| InvalidateMessage
	| PresenceMessage
	| BroadcastMessage
	| KickMessage;

export type ClientMessage =
	| { v: 1; type: "broadcast"; topic: string; payload: unknown }
	| { v: 1; type: "presence:get" };

const SERVER_MESSAGE_TYPES: ReadonlySet<string> = new Set([
	"invalidate",
	"presence",
	"broadcast",
	"kick",
]);

/**
 * Tolerant parse: returns null for malformed JSON, unknown versions, or
 * unknown message types so newer servers never break older clients.
 */
export function parseServerMessage(raw: string): ServerMessage | null {
	let data: unknown;
	try {
		data = JSON.parse(raw);
	} catch {
		return null;
	}
	if (typeof data !== "object" || data === null) {
		return null;
	}
	const message = data as { v?: unknown; type?: unknown };
	if (message.v !== SYNC_PROTOCOL_VERSION) {
		return null;
	}
	if (
		typeof message.type !== "string" ||
		!SERVER_MESSAGE_TYPES.has(message.type)
	) {
		return null;
	}
	return data as ServerMessage;
}

export function parseClientMessage(raw: string): ClientMessage | null {
	let data: unknown;
	try {
		data = JSON.parse(raw);
	} catch {
		return null;
	}
	if (typeof data !== "object" || data === null) {
		return null;
	}
	const message = data as { v?: unknown; type?: unknown; topic?: unknown };
	if (message.v !== SYNC_PROTOCOL_VERSION) {
		return null;
	}
	if (message.type === "presence:get") {
		return { v: 1, type: "presence:get" };
	}
	if (message.type === "broadcast" && typeof message.topic === "string") {
		return data as ClientMessage;
	}
	return null;
}
