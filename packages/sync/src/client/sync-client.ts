import type { Channel } from "../channels";
import { parseServerMessage, type ServerMessage } from "../protocol";
import { fullJitterBackoff } from "./backoff";

export type SyncStatus =
	| "connecting"
	| "open"
	| "reconnecting"
	| "closed"
	| "denied";

export interface SyncClientOptions {
	/** API origin, e.g. "https://api.example.com" — ws(s) URL is derived. */
	baseUrl: string;
	/** Defaults to "/sync". */
	path?: string;
	/** Override socket creation (e.g. React Native cookie header injection). */
	webSocketFactory?: (url: string) => WebSocket;
	/** Defaults: ping every 25s, force-reconnect if no pong within 10s. */
	heartbeatIntervalMs?: number;
	heartbeatTimeoutMs?: number;
	/** Defaults: 1s base, 30s max, full jitter. */
	backoffBaseMs?: number;
	backoffMaxMs?: number;
	onMessage: (channel: Channel, message: ServerMessage) => void;
	onStatusChange?: (channel: Channel, status: SyncStatus) => void;
	/** Fired when a channel re-opens AFTER a drop — trigger catch-up here. */
	onReconnected?: (channel: Channel) => void;
}

interface ManagedSocket {
	ws: WebSocket | null;
	status: SyncStatus;
	attempt: number;
	hasConnectedBefore: boolean;
	/** Stable for 30s resets the backoff attempt counter. */
	stableTimer: ReturnType<typeof setTimeout> | null;
	reconnectTimer: ReturnType<typeof setTimeout> | null;
	heartbeatTimer: ReturnType<typeof setInterval> | null;
	pongTimer: ReturnType<typeof setTimeout> | null;
	closedByClient: boolean;
}

const STABLE_RESET_MS = 30_000;

/**
 * Framework-agnostic sync connection manager: one WebSocket per channel
 * (each channel is its own Durable Object, so sockets can't be multiplexed),
 * with reconnect/backoff, heartbeat-based half-open detection, and kick
 * handling. Cookies authenticate the upgrade in browsers; native platforms
 * inject them via `webSocketFactory`.
 */
export class SyncClient {
	private sockets = new Map<Channel, ManagedSocket>();
	private readonly options: Required<
		Pick<
			SyncClientOptions,
			| "path"
			| "heartbeatIntervalMs"
			| "heartbeatTimeoutMs"
			| "backoffBaseMs"
			| "backoffMaxMs"
		>
	> &
		SyncClientOptions;

	constructor(options: SyncClientOptions) {
		this.options = {
			path: "/sync",
			heartbeatIntervalMs: 25_000,
			heartbeatTimeoutMs: 10_000,
			backoffBaseMs: 1_000,
			backoffMaxMs: 30_000,
			...options,
		};
	}

	/** Diffs against current channels: closes removed, opens added. */
	setChannels(channels: readonly Channel[]): void {
		const next = new Set(channels);
		for (const channel of [...this.sockets.keys()]) {
			if (!next.has(channel)) {
				this.closeChannel(channel);
			}
		}
		for (const channel of next) {
			if (!this.sockets.has(channel)) {
				this.openChannel(channel);
			}
		}
	}

	sendBroadcast(channel: Channel, topic: string, payload: unknown): void {
		const socket = this.sockets.get(channel);
		if (socket?.status === "open" && socket.ws) {
			socket.ws.send(
				JSON.stringify({ v: 1, type: "broadcast", topic, payload }),
			);
		}
	}

	requestPresence(channel: Channel): void {
		const socket = this.sockets.get(channel);
		if (socket?.status === "open" && socket.ws) {
			socket.ws.send(JSON.stringify({ v: 1, type: "presence:get" }));
		}
	}

	getStatus(channel: Channel): SyncStatus {
		return this.sockets.get(channel)?.status ?? "closed";
	}

	/** Tears down all connections (logout, unmount). */
	close(): void {
		for (const channel of [...this.sockets.keys()]) {
			this.closeChannel(channel);
		}
	}

	// ---------------------------------------------------------------------

	private openChannel(channel: Channel): void {
		const socket: ManagedSocket = {
			ws: null,
			status: "connecting",
			attempt: 0,
			hasConnectedBefore: false,
			stableTimer: null,
			reconnectTimer: null,
			heartbeatTimer: null,
			pongTimer: null,
			closedByClient: false,
		};
		this.sockets.set(channel, socket);
		this.connect(channel, socket);
	}

	private closeChannel(channel: Channel): void {
		const socket = this.sockets.get(channel);
		if (!socket) {
			return;
		}
		socket.closedByClient = true;
		this.clearTimers(socket);
		try {
			socket.ws?.close(1000, "client closed");
		} catch {
			// Already closed.
		}
		this.sockets.delete(channel);
		this.setStatus(channel, socket, "closed");
	}

	private connect(channel: Channel, socket: ManagedSocket): void {
		const url = `${this.wsBase()}${this.options.path}/${encodeURIComponent(channel)}`;
		let ws: WebSocket;
		try {
			ws = this.options.webSocketFactory
				? this.options.webSocketFactory(url)
				: new WebSocket(url);
		} catch (error) {
			console.error("[sync] failed to create WebSocket", error);
			this.scheduleReconnect(channel, socket);
			return;
		}
		socket.ws = ws;
		this.setStatus(
			channel,
			socket,
			socket.hasConnectedBefore ? "reconnecting" : "connecting",
		);

		ws.addEventListener("open", () => {
			if (socket.closedByClient) {
				return;
			}
			const wasReconnect = socket.hasConnectedBefore;
			socket.hasConnectedBefore = true;
			this.setStatus(channel, socket, "open");
			this.startHeartbeat(socket);
			// Reset backoff only after the connection proves stable.
			socket.stableTimer = setTimeout(() => {
				socket.attempt = 0;
			}, STABLE_RESET_MS);
			if (wasReconnect) {
				this.options.onReconnected?.(channel);
			}
		});

		ws.addEventListener("message", (event: MessageEvent) => {
			if (typeof event.data !== "string") {
				return;
			}
			if (event.data === "pong") {
				if (socket.pongTimer) {
					clearTimeout(socket.pongTimer);
					socket.pongTimer = null;
				}
				return;
			}
			const message = parseServerMessage(event.data);
			if (!message) {
				return;
			}
			if (message.type === "kick" && message.reason === "membership-revoked") {
				// Authorization said no — don't hammer the server; a channel
				// change (setChannels) or full reopen is required to retry.
				socket.closedByClient = true;
				this.clearTimers(socket);
				this.setStatus(channel, socket, "denied");
			}
			this.options.onMessage(channel, message);
		});

		ws.addEventListener("close", () => {
			this.clearTimers(socket);
			socket.ws = null;
			if (socket.closedByClient) {
				return;
			}
			// Covers session-expired kicks and network drops alike: reconnect
			// re-runs authorization with fresh cookies.
			this.scheduleReconnect(channel, socket);
		});

		ws.addEventListener("error", () => {
			// The close event follows and drives reconnection.
		});
	}

	private scheduleReconnect(channel: Channel, socket: ManagedSocket): void {
		if (socket.closedByClient || !this.sockets.has(channel)) {
			return;
		}
		this.setStatus(channel, socket, "reconnecting");
		const delay = fullJitterBackoff(
			socket.attempt,
			this.options.backoffBaseMs,
			this.options.backoffMaxMs,
		);
		socket.attempt += 1;
		socket.reconnectTimer = setTimeout(() => {
			socket.reconnectTimer = null;
			this.connect(channel, socket);
		}, delay);
	}

	private startHeartbeat(socket: ManagedSocket): void {
		socket.heartbeatTimer = setInterval(() => {
			if (!socket.ws || socket.status !== "open") {
				return;
			}
			try {
				socket.ws.send("ping");
			} catch {
				return;
			}
			socket.pongTimer ??= setTimeout(() => {
				// Half-open connection: no pong in time — force a reconnect.
				socket.pongTimer = null;
				try {
					socket.ws?.close(4000, "heartbeat timeout");
				} catch {
					// Close handler still fires.
				}
			}, this.options.heartbeatTimeoutMs);
		}, this.options.heartbeatIntervalMs);
	}

	private clearTimers(socket: ManagedSocket): void {
		for (const key of ["stableTimer", "reconnectTimer", "pongTimer"] as const) {
			if (socket[key]) {
				clearTimeout(socket[key] as ReturnType<typeof setTimeout>);
				socket[key] = null;
			}
		}
		if (socket.heartbeatTimer) {
			clearInterval(socket.heartbeatTimer);
			socket.heartbeatTimer = null;
		}
	}

	private setStatus(
		channel: Channel,
		socket: ManagedSocket,
		status: SyncStatus,
	): void {
		if (socket.status !== status) {
			socket.status = status;
			this.options.onStatusChange?.(channel, status);
		}
	}

	private wsBase(): string {
		return this.options.baseUrl
			.replace(/^https:/, "wss:")
			.replace(/^http:/, "ws:")
			.replace(/\/$/, "");
	}
}
