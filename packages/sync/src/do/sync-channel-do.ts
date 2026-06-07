import { DurableObject } from "cloudflare:workers";
import {
	type BroadcastMessage,
	type InvalidateMessage,
	type KickMessage,
	type PresenceMember,
	type PresenceMessage,
	parseClientMessage,
	type ServerMessage,
	type SyncEvent,
} from "../protocol";

/**
 * One instance per channel (`user:{id}`, `org:{id}`, ...). Stores NO domain
 * data — it is purely a WebSocket fan-out hub for invalidation events,
 * presence, and ephemeral broadcasts.
 *
 * Security model: clients never reach this object directly. The Worker
 * validates the session and channel authorization, then forwards the upgrade
 * with verified `x-sync-*` headers. Everything here trusts ONLY those headers
 * and per-socket attachments derived from them.
 *
 * Uses the WebSocket Hibernation API throughout: presence is always rebuilt
 * from `ctx.getWebSockets()` attachments so it survives eviction, and
 * heartbeats are answered by the runtime without waking the object.
 */

interface SocketAttachment {
	userId: string;
	channel: string;
	/** Epoch ms when the session backing this socket expires, or null. */
	expiresAt: number | null;
}

const USER_TAG_PREFIX = "u:";
const userTag = (userId: string) => `${USER_TAG_PREFIX}${userId}`;

/** Window for batching rapid identical invalidations into one frame. */
const COALESCE_WINDOW_MS = 50;
/** Limits for client-originated messages. */
const MAX_CLIENT_MESSAGE_BYTES = 8 * 1024;
const CLIENT_RATE_LIMIT_WINDOW_MS = 1_000;
const CLIENT_RATE_LIMIT_MAX_MESSAGES = 10;

/** Close codes (4xxx = application-defined). */
const CLOSE_CODE_KICKED = 4403;

export class SyncChannelDO extends DurableObject<unknown> {
	/** Pending invalidations keyed by `entity|op|id`. In-memory only: losing
	 * this on hibernation loses at most a 50ms buffer that either already
	 * flushed or never existed. */
	private pendingInvalidations = new Map<string, InvalidateMessage>();
	private flushScheduled = false;
	/** Per-socket client message rate tracking. Resets on hibernation, which
	 * only relaxes the cap — acceptable. */
	private clientRates = new WeakMap<
		WebSocket,
		{ windowStart: number; count: number }
	>();

	constructor(ctx: DurableObjectState, env: unknown) {
		super(ctx, env);
		// Heartbeats answered by the runtime WITHOUT waking the object.
		this.ctx.setWebSocketAutoResponse(
			new WebSocketRequestResponsePair("ping", "pong"),
		);
	}

	// ---------------------------------------------------------------------
	// HTTP upgrade — called only via stub.fetch() from the Worker, which has
	// already authenticated the session and authorized the channel.
	// ---------------------------------------------------------------------
	override async fetch(request: Request): Promise<Response> {
		if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
			return new Response("Expected WebSocket upgrade", { status: 426 });
		}
		const userId = request.headers.get("x-sync-user-id");
		const channel = request.headers.get("x-sync-channel");
		const expiresAtRaw = request.headers.get("x-sync-expires-at");
		if (!userId || !channel) {
			return new Response("Missing sync identity headers", { status: 400 });
		}
		const expiresAt = expiresAtRaw ? Number(expiresAtRaw) : null;

		const pair = new WebSocketPair();
		const client = pair[0];
		const server = pair[1];

		const isFirstConnectionForUser =
			this.ctx.getWebSockets(userTag(userId)).length === 0;

		this.ctx.acceptWebSocket(server, [userTag(userId)]);
		server.serializeAttachment({
			userId,
			channel,
			expiresAt: Number.isFinite(expiresAt) ? expiresAt : null,
		} satisfies SocketAttachment);

		// Fresh snapshot to EVERY socket (connection counts stay accurate on
		// all tabs/devices); join events additionally mark new users.
		this.broadcastRaw(this.presenceSnapshot(channel));
		if (isFirstConnectionForUser) {
			this.broadcastRaw(
				{
					v: 1,
					type: "presence",
					event: "join",
					channel,
					userId,
					ts: Date.now(),
				},
				server,
			);
		}
		await this.scheduleExpiryAlarm();

		return new Response(null, { status: 101, webSocket: client });
	}

	// ---------------------------------------------------------------------
	// RPC methods (typed via DurableObjectNamespace<SyncChannelDO>)
	// ---------------------------------------------------------------------

	/** Queue an invalidation event; rapid duplicates coalesce into one frame. */
	async publish(event: SyncEvent): Promise<void> {
		const key = `${event.entity}|${event.op}|${event.id}`;
		this.pendingInvalidations.set(key, {
			v: 1,
			type: "invalidate",
			entity: event.entity,
			op: event.op,
			id: event.id,
			ts: Date.now(),
		});
		this.scheduleFlush();
	}

	/** Server-originated ephemeral broadcast (webhooks, crons, services). */
	async broadcastEphemeral(
		topic: string,
		payload: unknown,
		from: string,
	): Promise<void> {
		this.broadcastRaw({
			v: 1,
			type: "broadcast",
			topic,
			payload,
			from,
			ts: Date.now(),
		});
	}

	/** Close all sockets for a user (e.g. org membership revoked). Reconnect
	 * re-runs authorization at the Worker, so they cannot rejoin. */
	async kick(
		userId: string,
		reason: KickMessage["reason"] = "membership-revoked",
	): Promise<void> {
		const sockets = this.ctx.getWebSockets(userTag(userId));
		if (sockets.length === 0) {
			return;
		}
		const message = JSON.stringify({
			v: 1,
			type: "kick",
			reason,
			ts: Date.now(),
		} satisfies KickMessage);
		let channel: string | null = null;
		for (const ws of sockets) {
			channel = this.attachmentOf(ws)?.channel ?? channel;
			try {
				ws.send(message);
				ws.close(CLOSE_CODE_KICKED, reason);
			} catch {
				// Socket already closing — nothing to do.
			}
		}
		if (channel) {
			this.broadcastRaw({
				v: 1,
				type: "presence",
				event: "leave",
				channel,
				userId,
				ts: Date.now(),
			});
		}
	}

	async getPresence(): Promise<PresenceMember[]> {
		return this.presenceMembers();
	}

	// ---------------------------------------------------------------------
	// Hibernation handlers
	// ---------------------------------------------------------------------

	async webSocketMessage(
		ws: WebSocket,
		message: string | ArrayBuffer,
	): Promise<void> {
		if (typeof message !== "string") {
			return;
		}
		if (message.length > MAX_CLIENT_MESSAGE_BYTES) {
			return;
		}
		if (!this.allowClientMessage(ws)) {
			return;
		}
		const attachment = this.attachmentOf(ws);
		if (!attachment) {
			return;
		}
		const parsed = parseClientMessage(message);
		if (!parsed) {
			return;
		}
		if (parsed.type === "presence:get") {
			ws.send(JSON.stringify(this.presenceSnapshot(attachment.channel)));
			return;
		}
		// Client broadcast: identity is ALWAYS stamped from the verified
		// attachment, never from the payload.
		this.broadcastRaw(
			{
				v: 1,
				type: "broadcast",
				topic: parsed.topic,
				payload: parsed.payload,
				from: attachment.userId,
				ts: Date.now(),
			} satisfies BroadcastMessage,
			ws,
		);
	}

	async webSocketClose(ws: WebSocket): Promise<void> {
		this.handleSocketGone(ws);
	}

	async webSocketError(ws: WebSocket): Promise<void> {
		this.handleSocketGone(ws);
	}

	/** Closes sockets whose backing session has expired, then reschedules for
	 * the next-earliest expiry. Idempotent (alarms auto-retry on failure). */
	async alarm(): Promise<void> {
		const now = Date.now();
		const message = JSON.stringify({
			v: 1,
			type: "kick",
			reason: "session-expired",
			ts: now,
		} satisfies KickMessage);
		for (const ws of this.ctx.getWebSockets()) {
			const attachment = this.attachmentOf(ws);
			if (attachment?.expiresAt && attachment.expiresAt <= now) {
				try {
					ws.send(message);
					ws.close(CLOSE_CODE_KICKED, "session-expired");
				} catch {
					// Already closing.
				}
			}
		}
		await this.scheduleExpiryAlarm();
	}

	// ---------------------------------------------------------------------
	// Internals
	// ---------------------------------------------------------------------

	private scheduleFlush(): void {
		if (this.flushScheduled) {
			return;
		}
		this.flushScheduled = true;
		// The brief timer defers hibernation by ~50ms — acceptable; it batches
		// bulk mutations (N writes in one request → one frame per distinct key).
		setTimeout(() => {
			this.flushScheduled = false;
			const messages = [...this.pendingInvalidations.values()];
			this.pendingInvalidations.clear();
			for (const message of messages) {
				this.broadcastRaw(message);
			}
		}, COALESCE_WINDOW_MS);
	}

	private broadcastRaw(message: ServerMessage, exclude?: WebSocket): void {
		const serialized = JSON.stringify(message);
		for (const ws of this.ctx.getWebSockets()) {
			if (ws === exclude) {
				continue;
			}
			try {
				ws.send(serialized);
			} catch {
				// Socket mid-close; close handler will fire.
			}
		}
	}

	private presenceMembers(exclude?: WebSocket): PresenceMember[] {
		const byUser = new Map<string, number>();
		for (const ws of this.ctx.getWebSockets()) {
			if (ws === exclude) {
				continue;
			}
			const attachment = this.attachmentOf(ws);
			if (attachment) {
				byUser.set(attachment.userId, (byUser.get(attachment.userId) ?? 0) + 1);
			}
		}
		return [...byUser.entries()].map(([userId, connections]) => ({
			userId,
			connections,
		}));
	}

	private presenceSnapshot(
		channel: string,
		exclude?: WebSocket,
	): PresenceMessage {
		return {
			v: 1,
			type: "presence",
			event: "snapshot",
			channel,
			members: this.presenceMembers(exclude),
			ts: Date.now(),
		};
	}

	private handleSocketGone(ws: WebSocket): void {
		const attachment = this.attachmentOf(ws);
		if (!attachment) {
			return;
		}
		this.broadcastRaw(this.presenceSnapshot(attachment.channel, ws), ws);
		// The closing socket may still be listed; count the others.
		const remaining = this.ctx
			.getWebSockets(userTag(attachment.userId))
			.filter((other) => other !== ws);
		if (remaining.length === 0) {
			this.broadcastRaw(
				{
					v: 1,
					type: "presence",
					event: "leave",
					channel: attachment.channel,
					userId: attachment.userId,
					ts: Date.now(),
				},
				ws,
			);
		}
	}

	private attachmentOf(ws: WebSocket): SocketAttachment | null {
		try {
			return (ws.deserializeAttachment() as SocketAttachment) ?? null;
		} catch {
			return null;
		}
	}

	private allowClientMessage(ws: WebSocket): boolean {
		const now = Date.now();
		const rate = this.clientRates.get(ws);
		if (!rate || now - rate.windowStart >= CLIENT_RATE_LIMIT_WINDOW_MS) {
			this.clientRates.set(ws, { windowStart: now, count: 1 });
			return true;
		}
		rate.count += 1;
		return rate.count <= CLIENT_RATE_LIMIT_MAX_MESSAGES;
	}

	private async scheduleExpiryAlarm(): Promise<void> {
		let earliest: number | null = null;
		const now = Date.now();
		for (const ws of this.ctx.getWebSockets()) {
			const expiresAt = this.attachmentOf(ws)?.expiresAt;
			if (expiresAt && expiresAt > now) {
				earliest =
					earliest === null ? expiresAt : Math.min(earliest, expiresAt);
			}
		}
		if (earliest !== null) {
			await this.ctx.storage.setAlarm(earliest);
		}
	}
}
